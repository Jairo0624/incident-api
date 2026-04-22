import { Body, Controller, Get, ParseFloatPipe, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import type { IncidentCDto } from 'src/core/models/incident.model';
import { logger } from 'src/config/logger';

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) {}
  
  @Post()
  async createIncident(@Body() incident: IncidentCDto){
    const result = await this.incidentsService.createIncident(incident);
    return result;
  }

  @Get('search/radius')
  async findIncidentByRadius(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
    @Query('radiusInMeters', ParseFloatPipe) radiusInMeters: number
  ){
    logger.info(`[IncidentController] Buscamos incidentes en un radio de : ${radiusInMeters} m`)
    const result = await this.incidentsService.findInRadius(lat,lon,radiusInMeters);
    return result;
  }

  @Get()
  async getAllIncidents(){
    logger.info["[Incident Controller] Recibiendo solicitud de findAllIncidents"]
    const result = await this.incidentsService.findAll();
    return result;
  }
}
