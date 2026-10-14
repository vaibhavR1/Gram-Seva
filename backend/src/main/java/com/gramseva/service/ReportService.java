package com.gramseva.service;

import com.gramseva.entity.*;
import com.gramseva.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TaxBillRepository taxBillRepository;
    private final PaymentRepository paymentRepository;
    private final CitizenRepository citizenRepository;
    private final PropertyRepository propertyRepository;
    private final WaterConnectionRepository waterConnectionRepository;
    private final PanchayatRepository panchayatRepository;

    public ReportService(TaxBillRepository taxBillRepository,
                         PaymentRepository paymentRepository,
                         CitizenRepository citizenRepository,
                         PropertyRepository propertyRepository,
                         WaterConnectionRepository waterConnectionRepository,
                         PanchayatRepository panchayatRepository) {
        this.taxBillRepository = taxBillRepository;
        this.paymentRepository = paymentRepository;
        this.citizenRepository = citizenRepository;
        this.propertyRepository = propertyRepository;
        this.waterConnectionRepository = waterConnectionRepository;
        this.panchayatRepository = panchayatRepository;
    }

    // =========================================================================
    // 1. MONTHLY TAX REPORT (PDF & EXCEL)
    // =========================================================================

    public byte[] generateMonthlyTaxReportPdf(int year, int month) {
        List<TaxBill> allBills = taxBillRepository.findAll();
        // Filter bills for the given month/year based on bill issue/due date
        List<TaxBill> monthlyBills = allBills.stream()
                .filter(b -> b.getBillDate() != null && b.getBillDate().getYear() == year && b.getBillDate().getMonthValue() == month)
                .collect(Collectors.toList());

        if (monthlyBills.isEmpty()) {
            monthlyBills = allBills; // fallback to include all current bills if none specific to month
        }

        String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        Document document = new Document(PageSize.A4.rotate(), 30, 30, 35, 35); // Landscape
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(20, 83, 45));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(71, 85, 105));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, new Color(100, 116, 139));

            // Header Section
            Paragraph header = new Paragraph("SHIVANE GRAM PANCHAYAT — MAHARASHTRA", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph sub = new Paragraph("MONTHLY TAX REVENUE & RECOVERY REGISTER (" + monthName.toUpperCase() + " " + year + ")", subTitleFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(12);
            document.add(sub);

            // Compute metrics
            BigDecimal houseTaxDemand = BigDecimal.ZERO;
            BigDecimal houseTaxCollected = BigDecimal.ZERO;
            BigDecimal waterTaxDemand = BigDecimal.ZERO;
            BigDecimal waterTaxCollected = BigDecimal.ZERO;

            for (TaxBill b : monthlyBills) {
                if ("HOUSE_TAX".equalsIgnoreCase(b.getBillType())) {
                    houseTaxDemand = houseTaxDemand.add(b.getTotalAmount());
                    houseTaxCollected = houseTaxCollected.add(b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO);
                } else if ("WATER_TAX".equalsIgnoreCase(b.getBillType())) {
                    waterTaxDemand = waterTaxDemand.add(b.getTotalAmount());
                    waterTaxCollected = waterTaxCollected.add(b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO);
                }
            }

            BigDecimal totalDemand = houseTaxDemand.add(waterTaxDemand);
            BigDecimal totalCollected = houseTaxCollected.add(waterTaxCollected);
            BigDecimal totalPending = totalDemand.subtract(totalCollected);

            // Summary Table
            PdfPTable sumTable = new PdfPTable(4);
            sumTable.setWidthPercentage(100);
            sumTable.setSpacingAfter(15);

            addCardCell(sumTable, "House Tax Assessed", "Rs. " + houseTaxDemand, "Collected: Rs. " + houseTaxCollected, boldFont, normalFont);
            addCardCell(sumTable, "Water Tax Assessed", "Rs. " + waterTaxDemand, "Collected: Rs. " + waterTaxCollected, boldFont, normalFont);
            addCardCell(sumTable, "Total Month Demand", "Rs. " + totalDemand, "Total Collected: Rs. " + totalCollected, boldFont, normalFont);
            addCardCell(sumTable, "Total Outstanding Dues", "Rs. " + totalPending, "Active Bills: " + monthlyBills.size(), boldFont, normalFont);

            document.add(sumTable);

            // Bills Detail Table
            PdfPTable billTable = new PdfPTable(8);
            billTable.setWidthPercentage(100);
            billTable.setWidths(new float[]{16, 20, 10, 14, 12, 12, 12, 14});
            billTable.setSpacingAfter(15);

            String[] headers = {"Bill Number", "Citizen Name", "Ward", "Tax Category", "Billed (Rs)", "Paid (Rs)", "Status", "Due Date"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(20, 83, 45));
                cell.setPadding(5);
                billTable.addCell(cell);
            }

            for (TaxBill b : monthlyBills) {
                String citizenName = b.getCitizen() != null && b.getCitizen().getUser() != null ? b.getCitizen().getUser().getFullName() : "Villager";
                String ward = b.getCitizen() != null ? b.getCitizen().getWardNumber() : "Ward-1";

                billTable.addCell(new Phrase(b.getBillNumber(), normalFont));
                billTable.addCell(new Phrase(citizenName, normalFont));
                billTable.addCell(new Phrase(ward, normalFont));
                billTable.addCell(new Phrase(b.getBillType().replace("_", " "), normalFont));
                billTable.addCell(new Phrase("Rs. " + b.getTotalAmount(), normalFont));
                billTable.addCell(new Phrase("Rs. " + (b.getPaidAmount() != null ? b.getPaidAmount() : "0.00"), normalFont));
                billTable.addCell(new Phrase(b.getStatus(), normalFont));
                billTable.addCell(new Phrase(b.getDueDate() != null ? b.getDueDate().toString() : "-", normalFont));
            }

            document.add(billTable);

            // Certification Signatures
            PdfPTable authTable = new PdfPTable(2);
            authTable.setWidthPercentage(100);
            PdfPCell leftAuth = new PdfPCell(new Phrase("Prepared By:\nPanchayat Tax Clerk & Revenue Inspector", footerFont));
            leftAuth.setBorder(Rectangle.NO_BORDER);
            PdfPCell rightAuth = new PdfPCell(new Phrase("Verified & Approved By:\nSarpanch / Village Development Officer (Gram Sevak)", footerFont));
            rightAuth.setBorder(Rectangle.NO_BORDER);
            rightAuth.setHorizontalAlignment(Element.ALIGN_RIGHT);
            authTable.addCell(leftAuth);
            authTable.addCell(rightAuth);
            document.add(authTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate monthly PDF report: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    public byte[] generateMonthlyTaxReportExcel(int year, int month) {
        List<TaxBill> allBills = taxBillRepository.findAll();
        List<TaxBill> monthlyBills = allBills.stream()
                .filter(b -> b.getBillDate() != null && b.getBillDate().getYear() == year && b.getBillDate().getMonthValue() == month)
                .collect(Collectors.toList());
        if (monthlyBills.isEmpty()) monthlyBills = allBills;

        String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF'); // UTF-8 BOM for Microsoft Excel

        csv.append("Shivane Gram Panchayat - Monthly Tax Revenue Report (").append(monthName).append(" ").append(year).append(")\n\n");
        csv.append("Bill Number,Citizen Name,Mobile,Ward,Tax Type,Financial Year,Base Amount (INR),Penalty (INR),Discount (INR),Total Amount (INR),Paid Amount (INR),Status,Due Date\n");

        BigDecimal totalAssessed = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;

        for (TaxBill b : monthlyBills) {
            String name = b.getCitizen() != null && b.getCitizen().getUser() != null ? escapeCsv(b.getCitizen().getUser().getFullName()) : "Villager";
            String mobile = b.getCitizen() != null && b.getCitizen().getUser() != null ? b.getCitizen().getUser().getPhone() : "N/A";
            String ward = b.getCitizen() != null ? b.getCitizen().getWardNumber() : "Ward-1";

            BigDecimal total = b.getTotalAmount() != null ? b.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal paid = b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO;

            totalAssessed = totalAssessed.add(total);
            totalCollected = totalCollected.add(paid);

            csv.append(escapeCsv(b.getBillNumber())).append(",")
                    .append(name).append(",")
                    .append(mobile).append(",")
                    .append(escapeCsv(ward)).append(",")
                    .append(escapeCsv(b.getBillType())).append(",")
                    .append(escapeCsv(b.getFinancialYear())).append(",")
                    .append(b.getBaseAmount()).append(",")
                    .append(b.getPenaltyAmount() != null ? b.getPenaltyAmount() : 0).append(",")
                    .append(b.getDiscountAmount() != null ? b.getDiscountAmount() : 0).append(",")
                    .append(total).append(",")
                    .append(paid).append(",")
                    .append(escapeCsv(b.getStatus())).append(",")
                    .append(b.getDueDate() != null ? b.getDueDate().toString() : "")
                    .append("\n");
        }

        csv.append("\nTOTAL SUMMARY,,,,\n");
        csv.append("Total Assessed Demand:,").append(totalAssessed).append(",INR\n");
        csv.append("Total Amount Collected:,").append(totalCollected).append(",INR\n");
        csv.append("Total Pending Balance:,").append(totalAssessed.subtract(totalCollected)).append(",INR\n");

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // =========================================================================
    // 2. YEARLY TAX REPORT (PDF & EXCEL)
    // =========================================================================

    public byte[] generateYearlyTaxReportPdf(String financialYear) {
        if (financialYear == null || financialYear.isBlank()) {
            financialYear = "2026-2027";
        }

        List<TaxBill> yearlyBills = taxBillRepository.findByFinancialYear(financialYear);
        if (yearlyBills.isEmpty()) {
            yearlyBills = taxBillRepository.findAll();
        }

        Document document = new Document(PageSize.A4.rotate(), 30, 30, 35, 35);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(20, 83, 45));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(71, 85, 105));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, new Color(100, 116, 139));

            Paragraph header = new Paragraph("SHIVANE GRAM PANCHAYAT — ZILLA PARISHAD PUNE", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph sub = new Paragraph("ANNUAL TAX ASSESSMENT & AUDIT REGISTER (FY " + financialYear + ")", subTitleFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(12);
            document.add(sub);

            // Compute statistics
            BigDecimal houseTaxDemand = BigDecimal.ZERO;
            BigDecimal houseTaxPaid = BigDecimal.ZERO;
            BigDecimal waterTaxDemand = BigDecimal.ZERO;
            BigDecimal waterTaxPaid = BigDecimal.ZERO;

            for (TaxBill b : yearlyBills) {
                if ("HOUSE_TAX".equalsIgnoreCase(b.getBillType())) {
                    houseTaxDemand = houseTaxDemand.add(b.getTotalAmount());
                    houseTaxPaid = houseTaxPaid.add(b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO);
                } else {
                    waterTaxDemand = waterTaxDemand.add(b.getTotalAmount());
                    waterTaxPaid = waterTaxPaid.add(b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO);
                }
            }

            BigDecimal totalDemand = houseTaxDemand.add(waterTaxDemand);
            BigDecimal totalCollected = houseTaxPaid.add(waterTaxPaid);
            BigDecimal totalPending = totalDemand.subtract(totalCollected);

            // Summary Table
            PdfPTable sumTable = new PdfPTable(4);
            sumTable.setWidthPercentage(100);
            sumTable.setSpacingAfter(15);

            addCardCell(sumTable, "Annual House Tax", "Rs. " + houseTaxDemand, "Collected: Rs. " + houseTaxPaid, boldFont, normalFont);
            addCardCell(sumTable, "Annual Water Tax", "Rs. " + waterTaxDemand, "Collected: Rs. " + waterTaxPaid, boldFont, normalFont);
            addCardCell(sumTable, "Total FY Demand", "Rs. " + totalDemand, "Collected: Rs. " + totalCollected, boldFont, normalFont);
            addCardCell(sumTable, "Total Overdue Arrears", "Rs. " + totalPending, "Recovery Rate: " + (totalDemand.doubleValue() > 0 ? String.format("%.1f%%", (totalCollected.doubleValue() / totalDemand.doubleValue()) * 100) : "0%"), boldFont, normalFont);

            document.add(sumTable);

            // Ledger Table
            PdfPTable ledgerTable = new PdfPTable(8);
            ledgerTable.setWidthPercentage(100);
            ledgerTable.setWidths(new float[]{15, 20, 10, 15, 12, 12, 12, 14});
            ledgerTable.setSpacingAfter(15);

            String[] headers = {"Bill Number", "Citizen Name", "Ward", "Assessment Type", "Assessed (Rs)", "Collected (Rs)", "Balance (Rs)", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(20, 83, 45));
                cell.setPadding(5);
                ledgerTable.addCell(cell);
            }

            for (TaxBill b : yearlyBills) {
                String citizenName = b.getCitizen() != null && b.getCitizen().getUser() != null ? b.getCitizen().getUser().getFullName() : "Villager";
                String ward = b.getCitizen() != null ? b.getCitizen().getWardNumber() : "Ward-1";
                BigDecimal assessed = b.getTotalAmount();
                BigDecimal paid = b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO;
                BigDecimal bal = assessed.subtract(paid);

                ledgerTable.addCell(new Phrase(b.getBillNumber(), normalFont));
                ledgerTable.addCell(new Phrase(citizenName, normalFont));
                ledgerTable.addCell(new Phrase(ward, normalFont));
                ledgerTable.addCell(new Phrase(b.getBillType().replace("_", " "), normalFont));
                ledgerTable.addCell(new Phrase("Rs. " + assessed, normalFont));
                ledgerTable.addCell(new Phrase("Rs. " + paid, normalFont));
                ledgerTable.addCell(new Phrase("Rs. " + bal, normalFont));
                ledgerTable.addCell(new Phrase(b.getStatus(), normalFont));
            }

            document.add(ledgerTable);

            // Signatures
            PdfPTable authTable = new PdfPTable(2);
            authTable.setWidthPercentage(100);
            PdfPCell l = new PdfPCell(new Phrase("Panchayat Internal Auditor & Accounts Section", footerFont));
            l.setBorder(Rectangle.NO_BORDER);
            PdfPCell r = new PdfPCell(new Phrase("Sarpanch & Village Development Officer (Sign & Seal)", footerFont));
            r.setBorder(Rectangle.NO_BORDER);
            r.setHorizontalAlignment(Element.ALIGN_RIGHT);
            authTable.addCell(l);
            authTable.addCell(r);
            document.add(authTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate yearly PDF report: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    public byte[] generateYearlyTaxReportExcel(String financialYear) {
        if (financialYear == null || financialYear.isBlank()) financialYear = "2026-2027";

        List<TaxBill> yearlyBills = taxBillRepository.findByFinancialYear(financialYear);
        if (yearlyBills.isEmpty()) yearlyBills = taxBillRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF');

        csv.append("Shivane Gram Panchayat - Annual Tax Assessment Register (FY ").append(financialYear).append(")\n\n");
        csv.append("Bill Number,Citizen Name,Mobile,Ward,Assessment Type,Property / Water Connection ID,Financial Year,Base Tax (INR),Total Assessed (INR),Total Collected (INR),Balance Due (INR),Status,Due Date\n");

        for (TaxBill b : yearlyBills) {
            String name = b.getCitizen() != null && b.getCitizen().getUser() != null ? escapeCsv(b.getCitizen().getUser().getFullName()) : "Villager";
            String mobile = b.getCitizen() != null && b.getCitizen().getUser() != null ? b.getCitizen().getUser().getPhone() : "N/A";
            String ward = b.getCitizen() != null ? b.getCitizen().getWardNumber() : "Ward-1";
            String ref = b.getProperty() != null ? b.getProperty().getPropertyNumber() : (b.getWaterConnection() != null ? b.getWaterConnection().getConnectionNumber() : "N/A");

            BigDecimal total = b.getTotalAmount();
            BigDecimal paid = b.getPaidAmount() != null ? b.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal balance = total.subtract(paid);

            csv.append(escapeCsv(b.getBillNumber())).append(",")
                    .append(name).append(",")
                    .append(mobile).append(",")
                    .append(escapeCsv(ward)).append(",")
                    .append(escapeCsv(b.getBillType())).append(",")
                    .append(escapeCsv(ref)).append(",")
                    .append(escapeCsv(b.getFinancialYear())).append(",")
                    .append(b.getBaseAmount()).append(",")
                    .append(total).append(",")
                    .append(paid).append(",")
                    .append(balance).append(",")
                    .append(escapeCsv(b.getStatus())).append(",")
                    .append(b.getDueDate() != null ? b.getDueDate().toString() : "")
                    .append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // =========================================================================
    // 3. CITIZEN CENSUS & ROSTER REPORT (PDF & EXCEL)
    // =========================================================================

    public byte[] generateCitizenCensusReportPdf() {
        List<Citizen> citizens = citizenRepository.findAll();
        List<Property> properties = propertyRepository.findAll();
        List<WaterConnection> connections = waterConnectionRepository.findAll();

        Document document = new Document(PageSize.A4.rotate(), 30, 30, 35, 35);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(20, 83, 45));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(71, 85, 105));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(51, 65, 85));
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, new Color(100, 116, 139));

            Paragraph header = new Paragraph("SHIVANE GRAM PANCHAYAT — VILLAGE CENSUS REGISTER", titleFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph sub = new Paragraph("OFFICIAL CITIZEN DEMOGRAPHICS, HOUSEHOLDS & UTILITY CONNECTIONS ROSTER", subTitleFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(12);
            document.add(sub);

            // Summary Metrics
            PdfPTable sumTable = new PdfPTable(4);
            sumTable.setWidthPercentage(100);
            sumTable.setSpacingAfter(15);

            addCardCell(sumTable, "Registered Citizens", String.valueOf(citizens.size()), "Verified Village Residents", boldFont, normalFont);
            addCardCell(sumTable, "Assessed Properties", String.valueOf(properties.size()), "Residential & Commercial", boldFont, normalFont);
            addCardCell(sumTable, "Active Water Taps", String.valueOf(connections.size()), "Potable Supply Connections", boldFont, normalFont);
            addCardCell(sumTable, "Electoral Wards", "3 Wards", "Shivane Gram Panchayat", boldFont, normalFont);

            document.add(sumTable);

            // Citizens Table
            PdfPTable citTable = new PdfPTable(7);
            citTable.setWidthPercentage(100);
            citTable.setWidths(new float[]{10, 22, 15, 10, 12, 18, 13});
            citTable.setSpacingAfter(15);

            String[] headers = {"Citizen ID", "Villager Full Name", "Mobile Number", "Ward", "House No", "Residential Address", "Properties"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(20, 83, 45));
                cell.setPadding(5);
                citTable.addCell(cell);
            }

            for (Citizen c : citizens) {
                String name = c.getUser() != null ? c.getUser().getFullName() : "Citizen";
                String mobile = c.getUser() != null ? c.getUser().getPhone() : "N/A";
                long propCount = properties.stream().filter(p -> p.getOwner() != null && p.getOwner().getId().equals(c.getId())).count();

                citTable.addCell(new Phrase("CIT-" + c.getId(), normalFont));
                citTable.addCell(new Phrase(name, boldFont));
                citTable.addCell(new Phrase(mobile, normalFont));
                citTable.addCell(new Phrase(c.getWardNumber(), normalFont));
                citTable.addCell(new Phrase(c.getHouseNumber() != null ? c.getHouseNumber() : "-", normalFont));
                citTable.addCell(new Phrase(c.getAddress() != null ? c.getAddress() : "Shivane Village", normalFont));
                citTable.addCell(new Phrase(propCount + " Property(ies)", normalFont));
            }

            document.add(citTable);

            // Seal
            PdfPTable authTable = new PdfPTable(2);
            authTable.setWidthPercentage(100);
            PdfPCell l = new PdfPCell(new Phrase("Gram Panchayat Census Officer & Data Operator", footerFont));
            l.setBorder(Rectangle.NO_BORDER);
            PdfPCell r = new PdfPCell(new Phrase("Certified by Sarpanch & Gram Sevak (Shivane)", footerFont));
            r.setBorder(Rectangle.NO_BORDER);
            r.setHorizontalAlignment(Element.ALIGN_RIGHT);
            authTable.addCell(l);
            authTable.addCell(r);
            document.add(authTable);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate citizen census PDF report: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    public byte[] generateCitizenCensusReportExcel() {
        List<Citizen> citizens = citizenRepository.findAll();
        List<Property> properties = propertyRepository.findAll();
        List<WaterConnection> connections = waterConnectionRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF');

        csv.append("Shivane Gram Panchayat - Complete Village Citizens Roster & Census Register\n\n");
        csv.append("Citizen ID,Full Name,Username,Mobile Number,Email,Ward Number,House Number,Address,Registered Properties Count,Property IDs,Water Connections Count,Water Connection Numbers\n");

        for (Citizen c : citizens) {
            String name = c.getUser() != null ? escapeCsv(c.getUser().getFullName()) : "Citizen";
            String username = c.getUser() != null ? escapeCsv(c.getUser().getUsername()) : "";
            String mobile = c.getUser() != null ? c.getUser().getPhone() : "";
            String email = c.getUser() != null && c.getUser().getEmail() != null ? c.getUser().getEmail() : "";

            List<Property> userProps = properties.stream().filter(p -> p.getOwner() != null && p.getOwner().getId().equals(c.getId())).toList();
            String propIds = userProps.stream().map(Property::getPropertyNumber).collect(Collectors.joining("; "));

            List<WaterConnection> userConns = connections.stream().filter(w -> w.getCitizen() != null && w.getCitizen().getId().equals(c.getId())).toList();
            String connNums = userConns.stream().map(WaterConnection::getConnectionNumber).collect(Collectors.joining("; "));

            csv.append("CIT-").append(c.getId()).append(",")
                    .append(name).append(",")
                    .append(username).append(",")
                    .append(mobile).append(",")
                    .append(email).append(",")
                    .append(escapeCsv(c.getWardNumber())).append(",")
                    .append(escapeCsv(c.getHouseNumber() != null ? c.getHouseNumber() : "")).append(",")
                    .append(escapeCsv(c.getAddress() != null ? c.getAddress() : "")).append(",")
                    .append(userProps.size()).append(",")
                    .append(escapeCsv(propIds)).append(",")
                    .append(userConns.size()).append(",")
                    .append(escapeCsv(connNums))
                    .append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    // Helper utilities
    private void addCardCell(PdfPTable table, String title, String mainValue, String subValue, Font boldFont, Font normalFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setPadding(8);
        cell.addElement(new Paragraph(title, normalFont));
        Paragraph val = new Paragraph(mainValue, boldFont);
        val.setSpacingBefore(3);
        cell.addElement(val);
        Paragraph sub = new Paragraph(subValue, normalFont);
        sub.setSpacingBefore(2);
        cell.addElement(sub);
        table.addCell(cell);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
