import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, HttpCode, Logger, NotFoundException, Param, Post, Put, Query, SerializeOptions, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, MoreThan, Repository } from "typeorm";
import { CreateEventDTO } from "./..//create-event.dto";
import { EventEntity } from "./event.entity";
import { UpdateEventDTO } from "./../update-event.dto";
import { AttendeeEntity } from "src/attendee.entity";
import { EventsService } from "./events.service";
import { ListEvents } from "./input/list.events";
import { CurrenteUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AuthGuardJwt } from "src/auth/auth-guard.jwt";

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
    private readonly logger = new Logger(EventsController.name);

    constructor(
        private readonly eventsService: EventsService
    ) {}

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Query() filter: ListEvents) {
      const events = await this.eventsService
        .getEventsWithAttendeeCountFilteredPaginated(
          filter,
          {
            total: true,
            currentPage: filter.page,
            limit: 2
          }
        );
      return events;
    }
/* 
    @Get('/practice')
    async practice() {
        return this.repository.find({
            select: ['id', 'when'],
            where: [{ 
                id: MoreThan(3),
                when: MoreThan(new Date('2021-02-12T13:00:00'))
            }, {
                description: Like('%meet%'),
            }],
            take: 2,
            order: {
                id: 'DESC'
            }
        });
    }

    @Get('/practice2') */
    //async practice2() {
        //   // // return await this.repository.findOne(
  //   // //   1,
  //   // //   { relations: ['attendees'] }
  //   // // );
  //   // const event = await this.repository.findOne(
  //   //   1,
  //   //   { relations: ['attendees'] }
  //   // );
  //   // // const event = new Event();
  //   // // event.id = 1;

  //   // const attendee = new Attendee();
  //   // attendee.name = 'Using cascade';
  //   // // attendee.event = event;

  //   // event.attendees.push(attendee);
  //   // // event.attendees = [];

  //   // // await this.attendeeRepository.save(attendee);
  //   // await this.repository.save(event);

  //   // return event;

  //   // return await this.repository.createQueryBuilder('e')
  //   //   .select(['e.id', 'e.name'])
  //   //   .orderBy('e.id', 'ASC')
  //   //   .take(3)
  //   //   .getMany();
    //}

    @Get('/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('id') id: number) {
        const event = await this.eventsService.getEvent(id);

        if (!event) {
          throw new NotFoundException();
        }
    
        return event;
    }

    @Post()
    @UseGuards(AuthGuardJwt)
    async create(@Body() input: CreateEventDTO, @CurrenteUser() user: User) {
        return await this.eventsService.createEvent(input, user);
    }

    @Put('/:id')
    @UseGuards(AuthGuardJwt)
    async update(@Param('id') id: number, 
        @Body() input: UpdateEventDTO,
        @CurrenteUser() user: User
    ) {
        const event = await this.eventsService.getEvent(id);

        if(!event) throw new NotFoundException();

        if(event.organizerId !== user.id) {
            throw new ForbiddenException(null, 'You are not allowed to modify the event');
        }

        return this.eventsService.updateEvent(event, input);
    }

    @Delete('/:id')
    @UseGuards(AuthGuardJwt)
    @HttpCode(204)
    async remove(@Param('id') id: number, @CurrenteUser() user: User) {
        const event = await this.eventsService.getEvent(id);

        if (!event) {
          throw new NotFoundException();
        }
    
        if (event.organizerId !== user.id) {
          throw new ForbiddenException(
            null, `You are not authorized to remove this event`
          );
        }
    
        await this.eventsService.deleteEvent(id);
    }
}