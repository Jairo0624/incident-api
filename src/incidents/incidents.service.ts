import { Injectable } from '@nestjs/common';
import { EmailOptions } from 'src/core/models/email-options.model';
import { Incident } from 'src/core/entities/incident.entity';
import { EmailService } from 'src/email/email.service';
import { generateIncidentEmailTemplate } from './templates/incident.template';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IncidentCDto } from 'src/core/models/incident.model';
import { logger } from 'src/config/logger';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';
import { CacheService } from 'src/cache/cache.service';

const CACHE_KEY_ALL_INCIDENTS = "incidents:all";

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepository : Repository<Incident>,
        private readonly emailService: EmailService) {}
        private readonly cacheService = new CacheService

        async findInRadius(lat: number, lon: number, radius: number): Promise<Incident[]> {
            try{
                //POSTGIS
                //SQL
                const result = await this.incidentRepository
                                        .createQueryBuilder('incident')
                                        .where(
                                            `ST_DWithin(
                                                incident.location::geography,
                                                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                                                :radius
                                                )`, {lat, lon, radius}
                                        )
                                        .getMany();
                return result;                                  

            } catch (error){
                logger.error(error)
                return [];
            }
        }

        async findAll() : Promise<Incident[]> {
            try{
                logger.info("[Incident Service] Ejecutando query de todos los incidentes")
                const incidentsObject = await this.cacheService.get<Incident[]>(CACHE_KEY_ALL_INCIDENTS);

                if (incidentsObject && incidentsObject.length > 0){
                    return incidentsObject;
                }
                const result = await this.incidentRepository.find();
                logger.info(`[Incident Service] Se encontraron ${result.length} incidentes`)

                await this.cacheService.set(CACHE_KEY_ALL_INCIDENTS, result);
                return result;
            }
            catch(error){
                logger.info("[Incident Service] ocurrio un error al querer traer los incidentes")
                logger.error(error);
                return [];
            }
        }

        async createIncident(incident: IncidentCDto) : Promise<Boolean> {
            //save
            //Generar un nuevo registro
            const newIncident = this.incidentRepository.create({
                title: incident.title,
                description : incident.description,
                type: incident.type,
                location : {
                    type: 'Point',
                    coordinates: [incident.lon, incident.lat]
                }
            });
            const generatedIncident = await this.incidentRepository.save(newIncident);
            await this.cacheService.delete(CACHE_KEY_ALL_INCIDENTS); //Borrar la cache de todos los incidentes para que se refresque con el nuevo incidente creado
            const template = generateIncidentEmailTemplate(incident);
            const option : EmailOptions = {
                to: "alvaradogonzalezjairo@gmail.com",
                subject: incident.title,
                htmlBody: template
            }
            // Incidente en DB

            //CRON JOB
            const result = await this.emailService.sendEmail(option);
            return result;
        }

        
    
}
