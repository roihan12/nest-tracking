import { IsNumber, Min, Max } from 'class-validator';

export class TrackingDto {
  readonly userId: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  readonly latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  readonly longitude: number;
}
