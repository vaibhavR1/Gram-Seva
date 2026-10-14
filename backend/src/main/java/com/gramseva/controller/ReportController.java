package com.gramseva.controller;

import com.gramseva.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // =========================================================================
    // MONTHLY REPORT DOWNLOADS (PDF & EXCEL)
    // =========================================================================

    @GetMapping("/monthly/pdf")
    public ResponseEntity<byte[]> downloadMonthlyPdf(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();

        byte[] pdfBytes = reportService.generateMonthlyTaxReportPdf(y, m);
        String filename = "Monthly_Tax_Report_" + y + "_" + String.format("%02d", m) + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/monthly/excel")
    public ResponseEntity<byte[]> downloadMonthlyExcel(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        int y = year != null ? year : LocalDate.now().getYear();
        int m = month != null ? month : LocalDate.now().getMonthValue();

        byte[] csvBytes = reportService.generateMonthlyTaxReportExcel(y, m);
        String filename = "Monthly_Tax_Report_" + y + "_" + String.format("%02d", m) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    // =========================================================================
    // YEARLY REPORT DOWNLOADS (PDF & EXCEL)
    // =========================================================================

    @GetMapping("/yearly/pdf")
    public ResponseEntity<byte[]> downloadYearlyPdf(
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear) {
        byte[] pdfBytes = reportService.generateYearlyTaxReportPdf(financialYear);
        String filename = "Annual_Tax_Audit_Report_" + financialYear.replace("/", "-") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/yearly/excel")
    public ResponseEntity<byte[]> downloadYearlyExcel(
            @RequestParam(required = false, defaultValue = "2026-2027") String financialYear) {
        byte[] csvBytes = reportService.generateYearlyTaxReportExcel(financialYear);
        String filename = "Annual_Tax_Audit_Report_" + financialYear.replace("/", "-") + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    // =========================================================================
    // CITIZEN CENSUS / ROSTER DOWNLOADS (PDF & EXCEL)
    // =========================================================================

    @GetMapping("/citizens/pdf")
    public ResponseEntity<byte[]> downloadCitizensPdf() {
        byte[] pdfBytes = reportService.generateCitizenCensusReportPdf();
        String filename = "Citizens_Census_Register_Shivane.pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/citizens/excel")
    public ResponseEntity<byte[]> downloadCitizensExcel() {
        byte[] csvBytes = reportService.generateCitizenCensusReportExcel();
        String filename = "Citizens_Census_Register_Shivane.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }
}
