import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class ChannelCreateDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	owner_id: number;

	@IsOptional()
	@IsNumber({}, {each: true})
	users_ids: number[];

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	password: string;

	@IsOptional()
	@IsBoolean()
	@IsNotEmpty()
	is_public: boolean;
}

export class ChannelJoinDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	user_id: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	password: string;
}

export class ChannelPasswordDto extends ChannelJoinDto {}

export class ChannelLeaveDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	user_id: number;
}

export class ChannelKickDto extends ChannelLeaveDto {
	@IsNumber()
	@IsNotEmpty()
	target_id: number;
}

export class MakeOpDto extends ChannelKickDto {}

export class UserBanDto extends ChannelKickDto {}

export class UserMuteDto extends UserBanDto {
	@IsNumber()
	@IsNotEmpty()
	@Min(2)
	mute_duration: number;
}

export class MessageCreateDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	uid: number;

	@IsString()
	@IsNotEmpty()
	text: string;

	@IsNumber()
	@IsNotEmpty()
	sender_id: number;
}
