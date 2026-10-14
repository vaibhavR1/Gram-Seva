package com.gramseva.config;

import com.gramseva.entity.*;
import com.gramseva.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PanchayatRepository panchayatRepository;
    private final CitizenRepository citizenRepository;
    private final PropertyRepository propertyRepository;
    private final WaterConnectionRepository waterConnectionRepository;
    private final TaxBillRepository taxBillRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final ComplaintRepository complaintRepository;
    private final AnnouncementRepository announcementRepository;
    private final WaterSupplyScheduleRepository scheduleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PanchayatRepository panchayatRepository,
                           CitizenRepository citizenRepository,
                           PropertyRepository propertyRepository,
                           WaterConnectionRepository waterConnectionRepository,
                           TaxBillRepository taxBillRepository,
                           PaymentRepository paymentRepository,
                           ReceiptRepository receiptRepository,
                           ComplaintRepository complaintRepository,
                           AnnouncementRepository announcementRepository,
                           WaterSupplyScheduleRepository scheduleRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.panchayatRepository = panchayatRepository;
        this.citizenRepository = citizenRepository;
        this.propertyRepository = propertyRepository;
        this.waterConnectionRepository = waterConnectionRepository;
        this.taxBillRepository = taxBillRepository;
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.complaintRepository = complaintRepository;
        this.announcementRepository = announcementRepository;
        this.scheduleRepository = scheduleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        System.out.println(">>> Seeding GramSeva Initial Demo Data & Roles <<<");

        // 1. Create Panchayat
        Panchayat panchayat = new Panchayat(
                "Shivane Gram Panchayat",
                "Haveli",
                "Pune",
                "Maharashtra",
                "411023",
                "Gram Panchayat Karyalay, Main Chowk, Shivane",
                "contact@panchayatshivane.gov.in",
                "+91 20 2529 1100",
                "Smt. Surekha Babanrao Patil (Sarpanch)",
                12450
        );
        panchayat = panchayatRepository.save(panchayat);

        // 2. Create Users
        User superAdmin = new User("superadmin", "superadmin@gramseva.gov.in",
                passwordEncoder.encode("Admin@123"), "Zilla Admin Officer", "+91 9822001122", Role.SUPER_ADMIN);
        superAdmin = userRepository.save(superAdmin);

        User sarpanchUser = new User("sarpanch", "sarpanch@panchayatshivane.gov.in",
                passwordEncoder.encode("Sarpanch@123"), "Surekha Babanrao Patil", "+91 9822334455", Role.SARPANCH);
        sarpanchUser = userRepository.save(sarpanchUser);

        User waterStaff = new User("waterstaff", "water@panchayatshivane.gov.in",
                passwordEncoder.encode("Water@123"), "Ganesh Pandurang Shinde", "+91 9822445566", Role.WATER_SUPPLIER);
        waterStaff = userRepository.save(waterStaff);

        User citizenUser1 = new User("citizen1", "ramesh.patil@example.com",
                passwordEncoder.encode("Citizen@123"), "Ramesh Dinkar Patil", "+91 9822556677", Role.CITIZEN);
        citizenUser1 = userRepository.save(citizenUser1);

        User citizenUser2 = new User("citizen2", "sunita.jadhav@example.com",
                passwordEncoder.encode("Citizen@123"), "Sunita Mohan Jadhav", "+91 9822667788", Role.CITIZEN);
        citizenUser2 = userRepository.save(citizenUser2);

        // 3. Create Citizens
        Citizen citizen1 = new Citizen(citizenUser1, panchayat, "XXXX-XXXX-4589", "RC-MH-2020-9912",
                "Ward-1", "H-104", "Shivaji Chowk, Main Road, Shivane", "Male", LocalDate.of(1982, 5, 14), "Farmer / Business");
        citizen1 = citizenRepository.save(citizen1);

        Citizen citizen2 = new Citizen(citizenUser2, panchayat, "XXXX-XXXX-8921", "RC-MH-2021-3341",
                "Ward-2", "H-208", "Mandir Galli, Shindevasti, Shivane", "Female", LocalDate.of(1988, 8, 22), "Teacher");
        citizen2 = citizenRepository.save(citizen2);

        // 4. Create Properties
        Property prop1 = new Property("GP-PROP-101", citizen1, panchayat, "RESIDENTIAL",
                1250.0, 1800.0, "Ward-1", "House No. 104, Shivaji Chowk, Shivane", new BigDecimal("1450.00"), "ACTIVE");
        prop1 = propertyRepository.save(prop1);

        Property prop2 = new Property("GP-PROP-102", citizen1, panchayat, "COMMERCIAL",
                600.0, 800.0, "Ward-1", "Shop No. 3, Gram Bazaar, Main Road", new BigDecimal("2800.00"), "ACTIVE");
        prop2 = propertyRepository.save(prop2);

        Property prop3 = new Property("GP-PROP-103", citizen2, panchayat, "RESIDENTIAL",
                980.0, 1400.0, "Ward-2", "House No. 208, Mandir Galli, Shivane", new BigDecimal("1200.00"), "ACTIVE");
        prop3 = propertyRepository.save(prop3);

        // 5. Create Water Connections
        WaterConnection wat1 = new WaterConnection("GP-WAT-201", prop1, citizen1, panchayat,
                "DOMESTIC", 15, new BigDecimal("120.00"), "MTR-88120", "ACTIVE", LocalDate.of(2022, 4, 1));
        wat1 = waterConnectionRepository.save(wat1);

        WaterConnection wat2 = new WaterConnection("GP-WAT-202", prop3, citizen2, panchayat,
                "DOMESTIC", 15, new BigDecimal("120.00"), "MTR-99411", "ACTIVE", LocalDate.of(2023, 1, 15));
        wat2 = waterConnectionRepository.save(wat2);

        // 6. Create Tax Bills
        // Current pending house tax for citizen 1
        TaxBill bill1 = new TaxBill("TB-HT-2026-1001", "HOUSE_TAX", prop1, null, citizen1, panchayat,
                "2026-2027", LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(2),
                new BigDecimal("1450.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("1450.00"),
                BigDecimal.ZERO, "PENDING", "Gram Panchayat Annual House Tax Assessment");
        taxBillRepository.save(bill1);

        // Current pending water tax for citizen 1 (12 months * 120 = 1440)
        TaxBill bill2 = new TaxBill("TB-WT-2026-2001", "WATER_TAX", prop1, wat1, citizen1, panchayat,
                "2026-2027", LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(2),
                new BigDecimal("1440.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("1440.00"),
                BigDecimal.ZERO, "PENDING", "Annual Water Supply Tariff");
        taxBillRepository.save(bill2);

        // Commercial shop pending bill for citizen 1
        TaxBill bill3 = new TaxBill("TB-HT-2026-1002", "HOUSE_TAX", prop2, null, citizen1, panchayat,
                "2026-2027", LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(2),
                new BigDecimal("2800.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("2800.00"),
                BigDecimal.ZERO, "PENDING", "Commercial Premises Property Assessment");
        taxBillRepository.save(bill3);

        // Historical PAID bill with payment and receipt for citizen 1
        TaxBill pastBill = new TaxBill("TB-HT-2025-0890", "HOUSE_TAX", prop1, null, citizen1, panchayat,
                "2025-2026", LocalDate.of(2025, 4, 15), LocalDate.of(2025, 8, 31),
                new BigDecimal("1350.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("1350.00"),
                new BigDecimal("1350.00"), "PAID", "Previous Year House Tax - Cleared");
        pastBill = taxBillRepository.save(pastBill);

        Payment paymentPast = new Payment("PAY-2025-78912", pastBill, new BigDecimal("1350.00"),
                "ONLINE_UPI", "UPI-HDFC-998234", "COMPLETED", null, "Paid via UPI QR");
        paymentPast.setPaymentDate(LocalDateTime.of(2025, 6, 20, 11, 30));
        paymentPast = paymentRepository.save(paymentPast);

        Receipt receiptPast = new Receipt("RCPT-2025-4512", paymentPast, pastBill, "VER-P2025-ABC89");
        receiptPast.setIssuedDate(LocalDateTime.of(2025, 6, 20, 11, 31));
        receiptRepository.save(receiptPast);

        // Citizen 2 pending bill
        TaxBill billCitizen2 = new TaxBill("TB-HT-2026-1003", "HOUSE_TAX", prop3, null, citizen2, panchayat,
                "2026-2027", LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(2),
                new BigDecimal("1200.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("1200.00"),
                BigDecimal.ZERO, "PENDING", "Annual House Tax");
        taxBillRepository.save(billCitizen2);

        // 7. Water Supply Schedules
        scheduleRepository.save(new WaterSupplySchedule("Ward-1", "Shivaji Chowk & Central Village",
                "06:00 AM - 08:30 AM", "05:30 PM - 07:30 PM", "REGULAR",
                "Regular daily supply from overhead reservoir", LocalDate.now(), waterStaff));

        scheduleRepository.save(new WaterSupplySchedule("Ward-2", "Mandir Galli & Shindevasti",
                "07:00 AM - 09:00 AM", "06:30 PM - 08:00 PM", "REGULAR",
                "Normal pressurized supply", LocalDate.now(), waterStaff));

        scheduleRepository.save(new WaterSupplySchedule("Ward-3", "Dongarwadi & ZP School Road",
                "08:00 AM - 10:00 AM", "Closed for repairs", "MAINTENANCE",
                "Pipeline maintenance ongoing near Dongarwadi junction. Expected restoration by evening.",
                LocalDate.now(), waterStaff));

        // 8. Public Announcements
        announcementRepository.save(new Announcement(
                "Gram Sabha Meeting for Village Annual Budget 2026-27",
                "Notice is hereby given to all village residents that the Special Gram Sabha meeting will be convened on 26th of this month at 10:00 AM in the Gram Panchayat Samaj Mandir. Topics include review of road concrete projects, water pipeline expansion, and street lighting sanctions. All adult villagers are requested to attend.",
                "GRAM_SABHA", LocalDate.now().minusDays(3), LocalDate.now().plusDays(20), "URGENT", sarpanchUser, true
        ));

        announcementRepository.save(new Announcement(
                "Water Supply Interruption Notice for Ward 3",
                "Due to urgent replacement of the 100mm main feeder pipeline near Dongarwadi water booster, water supply to Ward 3 will be suspended on tomorrow morning from 8 AM to 12 PM. Tanker water will be provided on request.",
                "WATER_SUPPLY", LocalDate.now().minusDays(1), LocalDate.now().plusDays(3), "IMPORTANT", waterStaff, true
        ));

        announcementRepository.save(new Announcement(
                "Free Health & Cataract Screening Camp",
                "Gram Panchayat in collaboration with Zilla Parishad Health Department is organizing a free health checkup, blood sugar, and cataract screening camp on Sunday at Primary Health Center (PHC). Free spectacles and medicines will be distributed.",
                "HEALTH_CAMP", LocalDate.now().minusDays(5), LocalDate.now().plusDays(10), "NORMAL", sarpanchUser, true
        ));

        announcementRepository.save(new Announcement(
                "PM Awas Yojana (Gramin) — New Beneficiary Registrations",
                "Eligible homeless and kutcha-house families can submit applications for the PM Awas Yojana housing subsidy at the Panchayat office with Aadhaar, ration card, and 7/12 extract before the end of the month.",
                "GOV_SCHEME", LocalDate.now().minusDays(8), LocalDate.now().plusDays(30), "IMPORTANT", sarpanchUser, true
        ));

        // 9. Sample Complaints
        Complaint c1 = new Complaint("CMP-2026-101", citizen1, "WATER_SUPPLY",
                "Low water pressure near House No 104",
                "The drinking water pressure in Ward-1 pipeline has been very low for the past 3 days during the morning schedule.",
                "Ward-1", null, "ASSIGNED", "HIGH", waterStaff, "Inspecting valve distribution box");
        complaintRepository.save(c1);

        Complaint c2 = new Complaint("CMP-2026-102", citizen1, "STREET_LIGHT",
                "Street light blinking and sparking near Shivaji Chowk corner",
                "Pole light pole #14 has a loose connection sparking when wind blows.",
                "Ward-1", null, "RESOLVED", "MEDIUM", sarpanchUser, "Replaced LED fixture and tightened wiring clamp");
        c2.setResolvedAt(LocalDateTime.now().minusDays(2));
        complaintRepository.save(c2);

        Complaint c3 = new Complaint("CMP-2026-103", citizen2, "SANITATION_DRAINAGE",
                "Drainage overflow in Mandir Galli",
                "Open gutter is clogged with debris causing wastewater to spill on the concrete road.",
                "Ward-2", null, "SUBMITTED", "HIGH", null, null);
        complaintRepository.save(c3);

        // 10. Audit Log
        auditLogRepository.save(new AuditLog("SYSTEM_BOOTSTRAP", "System", 1L, superAdmin,
                "127.0.0.1", "GramSeva initial system setup and data initialization completed."));

        System.out.println(">>> Demo data seeded successfully! Default accounts ready. <<<");
    }
}
