import { HttpException, Logger, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Channel } from "@prisma/client";
import { Socket, Namespace } from 'socket.io';
import { BadRequestFilter } from "./channel.filters";
import { ChannelService } from "./channel.service";
import { ChannelCreateDto, ChannelJoinDto, MessageCreateDto } from "./dto";

@UseFilters(new BadRequestFilter())
@WebSocketGateway({namespace: 'channel'})
export class ChannelGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger(ChannelGateway.name);

	@WebSocketServer() io: Namespace;

	constructor (private readonly channelService: ChannelService) {}

	afterInit() {
		this.logger.log('Websocket gateway initialized.');
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`New client with id: ${client.id} connected.`);
		this.logger.log(`Number of connection: ${this.io.sockets.size}.`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Disconnected client with id: ${client.id}.`);
		this.logger.log(`Number of connection: ${this.io.sockets.size}.`);
	}

	@UsePipes(new ValidationPipe({whitelist: true}))
	@SubscribeMessage('join')
	async handleJoin(@MessageBody() dto: ChannelJoinDto, @ConnectedSocket() client: Socket) {
		try {
			await this.channelService.join(dto);
			client.join(dto.name);
			this.io.in(dto.name).emit('join', {name: dto.name, user: dto.user_id});
		} catch (e) {
			throw new WsException(e);
		}
	}

	@SubscribeMessage('message')
	async handleMessage(
		@MessageBody('channel') channel: string,
		@MessageBody('data') dto: MessageCreateDto,
		@ConnectedSocket() client: Socket)
	{
		this.checkUser(client, channel);
		try {
			const message = await this.channelService.postMessage(channel, dto);
			this.io.in(channel).emit('message', message);
		} catch (e) {
			throw new WsException(e);
		}
	}

	checkUser(client: Socket, channel: string) {
		if (!client.rooms.has(channel))
			throw new WsException(`error: client hasnt joined room ${channel}`);
	}
}
