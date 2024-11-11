import { Controller, Get, Query } from '@nestjs/common';
import { MealsService } from './meals.service';
import { GetMealsDto } from './dto/get-meals.dto';

@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  getMeals(@Query() dto: GetMealsDto) {
    return this.mealsService.getMeals(dto);
  }
}
