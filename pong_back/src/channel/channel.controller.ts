import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ChannelService } from "./channel.service";
import { ChannelCreateDto, ChannelJoinDto, ChannelLeaveDto, MessageCreateDto } from "./dto";

@Controller('channel')
export class ChannelController {
	constructor (private channelService: ChannelService) {}

	@Get('info')
	getAllChannels() {
		return this.channelService.getAll();
	}

	@Get('info/:name')
	getChannel(@Param() params) {
		return this.channelService.get(params.name);
	}

	@Get('info/:name/:attribute')
	getChannelInfo(@Param() params) {
		return this.channelService.getInfo(params.name, params.attribute);
	}

	@Post('create')
	createChannel(@Body() dto: ChannelCreateDto) {
		return this.channelService.create(dto);
	}

	@Post('join')
	joinChannel(@Body() dto: ChannelJoinDto) {
		return this.channelService.join(dto);
	}

	@Post('leave')
	leaveChannel(@Body() dto: ChannelLeaveDto) {
		return this.channelService.leave(dto);
	}

	@Get(':name/messages')
	getAllMessages(@Param() params) {
		return this.channelService.getAllMessages(params.name);
	}
}
