import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileType } from './profile.entity';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  list(@Query('type') type: ProfileType = 'plus') {
    return this.profileService.listByType(type);
  }

  @Get('tree')
  tree() {
    return this.profileService.getTree();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.profileService.getDetails(id);
  }
}
