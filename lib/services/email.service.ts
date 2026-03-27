import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Heritage Housing <noreply@heritagehousing.cl>";

export async function sendConfirmationEmail(
  reservation: {
    id: string;
    guestName: string;
    guestEmail: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: unknown;
    property: {
      name: string;
      location: string;
    };
  }
) {
  const nights = Math.ceil(
    (new Date(reservation.checkOut).getTime() -
      new Date(reservation.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return resend.emails.send({
    from: FROM_EMAIL,
    to: reservation.guestEmail,
    subject: `Confirmación de Reserva - ${reservation.property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">¡Reserva Confirmada!</h1>
        <p>Hola ${reservation.guestName},</p>
        <p>Tu reserva ha sido confirmada. Aquí están los detalles:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Propiedad:</strong> ${reservation.property.name}</p>
          <p><strong>Ubicación:</strong> ${reservation.property.location}</p>
          <p><strong>Check-in:</strong> ${new Date(reservation.checkIn).toLocaleDateString(
            "es-CL"
          )}</p>
          <p><strong>Check-out:</strong> ${new Date(
            reservation.checkOut
          ).toLocaleDateString("es-CL")}</p>
          <p><strong>Noches:</strong> ${nights}</p>
          <p><strong>Total:</strong> $${Number(reservation.totalPrice).toLocaleString(
            "es-CL"
          )} CLP</p>
        </div>
        
        <p>Te esperamos. Si tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <p>¡Saludos,<br>Heritage Housing</p>
      </div>
    `,
  });
}

export async function sendLeadNotification(
  lead: {
    name: string;
    email: string;
    phone?: string | null;
    projectType: string;
    message: string;
  }
) {
  const projectTypeLabels: Record<string, string> = {
    cocina: "Cocina",
    baño: "Baño",
    vivienda_completa: "Vivienda Completa",
    exterior: "Espacios Exteriores",
    oficina: "Oficina",
    otro: "Otro",
  };

  return resend.emails.send({
    from: FROM_EMAIL,
    to: "contacto@heritagehousing.cl",
    subject: `Nuevo Lead - ${projectTypeLabels[lead.projectType] || lead.projectType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nuevo Lead de Remodelación</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Teléfono:</strong> ${lead.phone || "No proporcionado"}</p>
          <p><strong>Tipo de Proyecto:</strong> ${
            projectTypeLabels[lead.projectType] || lead.projectType
          }</p>
          <p><strong>Mensaje:</strong></p>
          <p>${lead.message}</p>
        </div>
      </div>
    `,
  });
}

export async function sendReservationNotification(
  reservation: {
    id: string;
    guestName: string;
    guestEmail: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: unknown;
    property: {
      name: string;
    };
  }
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: "contacto@heritagehousing.cl",
    subject: `Nueva Reserva Directa - ${reservation.property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Nueva Reserva Directa</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Huésped:</strong> ${reservation.guestName}</p>
          <p><strong>Email:</strong> ${reservation.guestEmail}</p>
          <p><strong>Propiedad:</strong> ${reservation.property.name}</p>
          <p><strong>Check-in:</strong> ${new Date(
            reservation.checkIn
          ).toLocaleDateString("es-CL")}</p>
          <p><strong>Check-out:</strong> ${new Date(
            reservation.checkOut
          ).toLocaleDateString("es-CL")}</p>
          <p><strong>Total:</strong> $${Number(reservation.totalPrice).toLocaleString(
            "es-CL"
          )} CLP</p>
          <p><strong>ID Reserva:</strong> ${reservation.id}</p>
        </div>
      </div>
    `,
  });
}
