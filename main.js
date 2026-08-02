"use strict";

/*
 * Sustituye este valor por el Client ID creado en Google Cloud.
 *
 * Ejemplo:
 * 1234567890-abcdefgh.apps.googleusercontent.com
 */
const GOOGLE_CLIENT_ID =
    "401085655205-eaddc84uf8bi094u70t84g316j64bu92.apps.googleusercontent.com";

/*
 * Este permiso está limitado a los eventos de calendarios
 * propiedad del usuario.
 */
const CALENDAR_SCOPE =
    "https://www.googleapis.com/auth/calendar.events.owned";

const calendarButton =
    document.getElementById("calendar-button");

const calendarStatus =
    document.getElementById("calendar-status");

let tokenClient = null;

/*
 * Google ejecutará esta función cuando termine de cargar
 * Google Identity Services.
 */
window.gisLoaded = function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: CALENDAR_SCOPE,

        callback: async function handleTokenResponse(response) {
            if (response.error) {
                showError(
                    response.error_description
                    || "No se pudo autorizar Google Calendar."
                );

                return;
            }

            await createWeddingEvent(response.access_token);
        },

        error_callback: function handleOAuthError(error) {
            console.error("Error OAuth:", error);

            showError(
                "La autorización fue cancelada o bloqueada."
            );
        }
    });

    calendarButton.disabled = false;
};

calendarButton.addEventListener("click", function () {
    if (!tokenClient) {
        showError(
            "Google Calendar todavía no está disponible."
        );

        return;
    }

    calendarButton.disabled = true;
    calendarStatus.textContent =
        "Conectando con Google Calendar…";

    /*
     * Google mostrará la selección de cuenta y, cuando
     * corresponda, la pantalla de consentimiento.
     */
    tokenClient.requestAccessToken();
});

async function createWeddingEvent(accessToken) {
    /*
     * Evento de día completo.
     *
     * La fecha de finalización de Google Calendar es exclusiva:
     * para que dure todo el 19 de junio, termina el día 20.
     */
    const weddingEvent = {
        summary: "Boda Daria y Joaquin",

        description:
            "Celebración de la boda de Daria y Joaquin.",

        location:
            "Wólka Niedźwiedzka",

        start: {
            date: "2027-06-19"
        },

        end: {
            date: "2027-06-20"
        },

        reminders: {
            useDefault: true
        }
    };

    try {
        const response = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(weddingEvent)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error?.message
                || "Google Calendar rechazó la solicitud."
            );
        }

        calendarButton.textContent =
            "Añadido al calendario";

        calendarButton.disabled = true;

        calendarStatus.textContent =
            "La boda se ha añadido correctamente a tu Google Calendar.";

        console.log("Evento creado:", result);
    } catch (error) {
        console.error("Error creando el evento:", error);

        showError(
            error.message
            || "No se pudo añadir el evento."
        );
    }
}

function showError(message) {
    calendarStatus.textContent = message;

    calendarButton.disabled = false;
}