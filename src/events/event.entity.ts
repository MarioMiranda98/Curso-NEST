import { Expose } from "class-transformer";
import { AttendeeEntity } from "src/attendee.entity";
import { User } from "src/auth/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EventEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column()
    @Expose()
    name: string;

    @Column()
    @Expose()
    description: string;
    
    @Column()
    @Expose()
    when: Date;

    @Column()
    @Expose()
    address: string;

    @Expose()
    @OneToMany(() => AttendeeEntity, (attendee) => attendee.event, { cascade: true })
    attendees: AttendeeEntity[]

    @ManyToOne(() => User, (user) => user.orgnaized)
    @JoinColumn({ name: 'organizerId' })
    @Expose()
    organizer: User;

    @Column({ nullable: true })
    @Expose()
    organizerId: number;
    
    @Expose()
    attendeeCount?: number;
    
    @Expose()
    attendeeRejected?: number;
    
    @Expose()
    attendeeMaybe?: number;
    
    @Expose()
    attendeeAcepted?: number;
}