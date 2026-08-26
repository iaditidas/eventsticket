import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

export interface PDFTicketData {
  ticketCode: string;
  eventName: string;
  venue: string;
  eventDate: string;
  categoryName: string;
  customerName: string;
  customerEmail: string;
  price: number;
}

export class TicketService {
  static async generateQRCodeDataURL(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 250,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });
  }

  static async generateTicketPDFStream(data: PDFTicketData): Promise<InstanceType<typeof PDFDocument>> {

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const qrDataUrl = await this.generateQRCodeDataURL(data.ticketCode);
    const qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');

    // Header banner
    doc.rect(40, 40, 515, 80).fill('#4f46e5');
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('EVENT ADMISSION PASS', 60, 60);
    doc.fontSize(12).font('Helvetica').text('Present this QR code at venue check-in', 60, 92);

    // Main Card Box
    doc.rect(40, 140, 515, 340).strokeColor('#e2e8f0').lineWidth(2).stroke();

    // Event Info
    doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text(data.eventName, 60, 165);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('VENUE', 60, 205);
    doc.fontSize(12).font('Helvetica').fillColor('#1e293b').text(data.venue, 60, 220);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('DATE & TIME', 60, 255);
    doc.fontSize(12).font('Helvetica').fillColor('#1e293b').text(data.eventDate, 60, 270);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('TICKET CATEGORY', 60, 305);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#4f46e5').text(`${data.categoryName.toUpperCase()} — $${data.price.toFixed(2)}`, 60, 320);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('ATTENDEE', 60, 355);
    doc.fontSize(12).font('Helvetica').fillColor('#1e293b').text(`${data.customerName} (${data.customerEmail})`, 60, 370);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('TICKET CODE', 60, 405);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0f172a').text(data.ticketCode, 60, 420);

    // QR Code Image
    doc.image(qrBuffer, 350, 180, { width: 170, height: 170 });

    // Footer note
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94a3b8').text('This ticket is valid for one-time admission. Keep your QR code secure.', 40, 500, { align: 'center', width: 515 });

    doc.end();
    return doc;
  }
}
