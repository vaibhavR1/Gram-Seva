package com.gramseva.service;

import com.gramseva.entity.Receipt;
import com.gramseva.entity.TaxBill;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a");

    public byte[] generateReceiptPdf(Receipt receipt) {
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(20, 83, 45));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(71, 85, 105));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(15, 23, 42));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new Color(100, 116, 139));

            // Header Section
            Paragraph header = new Paragraph("GRAM PANCHAYAT ADMINISTRATION PORTAL", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            String panchayatName = receipt.getBill().getPanchayat() != null
                    ? receipt.getBill().getPanchayat().getName()
                    : "Gram Panchayat Shivane";
            Paragraph subHeader = new Paragraph("Office of the Sarpanch & Village Development Officer — " + panchayatName, subTitleFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(8);
            document.add(subHeader);

            Paragraph badge = new Paragraph("OFFICIAL TAX PAYMENT RECEIPT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 118, 110)));
            badge.setAlignment(Element.ALIGN_CENTER);
            badge.setSpacingAfter(15);
            document.add(badge);

            // Receipt Meta Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(15);

            TaxBill bill = receipt.getBill();

            addMetaRow(metaTable, "Receipt No:", receipt.getReceiptNumber(), boldFont, normalFont);
            addMetaRow(metaTable, "Payment Date:", receipt.getIssuedDate().format(DATE_FMT), boldFont, normalFont);
            addMetaRow(metaTable, "Bill No:", bill.getBillNumber(), boldFont, normalFont);
            addMetaRow(metaTable, "Financial Year:", bill.getFinancialYear(), boldFont, normalFont);
            addMetaRow(metaTable, "Transaction Ref:", receipt.getPayment().getPaymentReference(), boldFont, normalFont);
            addMetaRow(metaTable, "Payment Mode:", receipt.getPayment().getPaymentMode(), boldFont, normalFont);

            document.add(metaTable);

            // Citizen & Property Details
            Paragraph citizenSec = new Paragraph("CITIZEN & ASSESSMENT DETAILS", boldFont);
            citizenSec.setSpacingAfter(6);
            document.add(citizenSec);

            PdfPTable citizenTable = new PdfPTable(2);
            citizenTable.setWidthPercentage(100);
            citizenTable.setSpacingAfter(15);

            String citizenName = bill.getCitizen().getUser().getFullName();
            String ward = bill.getCitizen().getWardNumber();
            String address = bill.getCitizen().getAddress();

            addMetaRow(citizenTable, "Citizen Name:", citizenName, boldFont, normalFont);
            addMetaRow(citizenTable, "Ward Number:", ward != null ? ward : "N/A", boldFont, normalFont);
            addMetaRow(citizenTable, "Address:", address != null ? address : "Village Center", boldFont, normalFont);

            if ("HOUSE_TAX".equalsIgnoreCase(bill.getBillType()) && bill.getProperty() != null) {
                addMetaRow(citizenTable, "Property No / Milkat No:", bill.getProperty().getPropertyNumber(), boldFont, normalFont);
                addMetaRow(citizenTable, "Property Type:", bill.getProperty().getPropertyType(), boldFont, normalFont);
            } else if ("WATER_TAX".equalsIgnoreCase(bill.getBillType()) && bill.getWaterConnection() != null) {
                addMetaRow(citizenTable, "Water Connection No:", bill.getWaterConnection().getConnectionNumber(), boldFont, normalFont);
                addMetaRow(citizenTable, "Connection Type:", bill.getWaterConnection().getConnectionType(), boldFont, normalFont);
            }

            document.add(citizenTable);

            // Financial Breakdown Table
            Paragraph breakdownTitle = new Paragraph("PAYMENT BREAKDOWN", boldFont);
            breakdownTitle.setSpacingAfter(6);
            document.add(breakdownTitle);

            PdfPTable finTable = new PdfPTable(2);
            finTable.setWidthPercentage(100);
            finTable.setWidths(new float[]{70, 30});
            finTable.setSpacingAfter(20);

            PdfPCell h1 = new PdfPCell(new Phrase("Description", headerFont));
            h1.setBackgroundColor(new Color(20, 83, 45));
            h1.setPadding(6);
            PdfPCell h2 = new PdfPCell(new Phrase("Amount (INR)", headerFont));
            h2.setBackgroundColor(new Color(20, 83, 45));
            h2.setPadding(6);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            finTable.addCell(h1);
            finTable.addCell(h2);

            addTableRow(finTable, "Base " + bill.getBillType().replace("_", " ") + " Assessment", "Rs. " + bill.getBaseAmount(), normalFont);
            if (bill.getPenaltyAmount() != null && bill.getPenaltyAmount().doubleValue() > 0) {
                addTableRow(finTable, "Late Payment Surcharge / Penalty", "Rs. " + bill.getPenaltyAmount(), normalFont);
            }
            if (bill.getDiscountAmount() != null && bill.getDiscountAmount().doubleValue() > 0) {
                addTableRow(finTable, "Early Payment Rebate / Discount", "- Rs. " + bill.getDiscountAmount(), normalFont);
            }

            // Total row
            PdfPCell totalDescCell = new PdfPCell(new Phrase("Total Amount Paid", boldFont));
            totalDescCell.setBackgroundColor(new Color(241, 245, 249));
            totalDescCell.setPadding(8);
            PdfPCell totalValCell = new PdfPCell(new Phrase("Rs. " + receipt.getPayment().getAmount(), boldFont));
            totalValCell.setBackgroundColor(new Color(241, 245, 249));
            totalValCell.setPadding(8);
            totalValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            finTable.addCell(totalDescCell);
            finTable.addCell(totalValCell);

            document.add(finTable);

            // Verification & Signature Box
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);

            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            Paragraph qrInfo = new Paragraph("Digital Verification Code:\n" +
                    (receipt.getVerificationHash() != null ? receipt.getVerificationHash() : "GS-AUTH-" + receipt.getId()), footerFont);
            qrCell.addElement(qrInfo);

            PdfPCell sigCell = new PdfPCell();
            sigCell.setBorder(Rectangle.NO_BORDER);
            sigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph sigInfo = new Paragraph("Digitally Signed by:\nVillage Development Officer / Sarpanch\nGram Panchayat Administration", footerFont);
            sigInfo.setAlignment(Element.ALIGN_RIGHT);
            sigCell.addElement(sigInfo);

            footerTable.addCell(qrCell);
            footerTable.addCell(sigCell);
            document.add(footerTable);

            // Note
            Paragraph note = new Paragraph("\n* Note: This is a computer-generated tax receipt from GramSeva Portal and does not require physical stamp.", footerFont);
            note.setAlignment(Element.ALIGN_CENTER);
            document.add(note);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addMetaRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(3);
        PdfPCell c2 = new PdfPCell(new Phrase(value != null ? value : "-", valFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(3);
        table.addCell(c1);
        table.addCell(c2);
    }

    private void addTableRow(PdfPTable table, String item, String amount, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(item, font));
        c1.setPadding(5);
        PdfPCell c2 = new PdfPCell(new Phrase(amount, font));
        c2.setPadding(5);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c1);
        table.addCell(c2);
    }
}
