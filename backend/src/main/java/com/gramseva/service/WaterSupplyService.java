package com.gramseva.service;

import com.gramseva.entity.User;
import com.gramseva.entity.WaterConnection;
import com.gramseva.entity.WaterSupplySchedule;
import com.gramseva.repository.WaterConnectionRepository;
import com.gramseva.repository.WaterSupplyScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WaterSupplyService {

    private final WaterSupplyScheduleRepository scheduleRepository;
    private final WaterConnectionRepository connectionRepository;

    public WaterSupplyService(WaterSupplyScheduleRepository scheduleRepository,
                              WaterConnectionRepository connectionRepository) {
        this.scheduleRepository = scheduleRepository;
        this.connectionRepository = connectionRepository;
    }

    public List<WaterSupplySchedule> getAllSchedules() {
        return scheduleRepository.findAllByOrderByWardNumberAsc();
    }

    public List<WaterConnection> getAllConnections() {
        return connectionRepository.findAll();
    }

    public List<WaterConnection> getConnectionsByCitizen(Long citizenId) {
        return connectionRepository.findByCitizenId(citizenId);
    }

    @Transactional
    public WaterSupplySchedule updateSchedule(WaterSupplySchedule schedule, User staff) {
        schedule.setUpdatedBy(staff);
        if (schedule.getEffectiveDate() == null) {
            schedule.setEffectiveDate(LocalDate.now());
        }
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public WaterSupplySchedule updateStatus(Long scheduleId, String status, String noticeMessage, User staff) {
        WaterSupplySchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found with id: " + scheduleId));

        schedule.setStatus(status);
        schedule.setNoticeMessage(noticeMessage);
        schedule.setUpdatedBy(staff);
        schedule.setEffectiveDate(LocalDate.now());
        return scheduleRepository.save(schedule);
    }
}
