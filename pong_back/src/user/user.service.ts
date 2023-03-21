import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "src/prisma/prisma.service";
import { UserCreateDto, UserUpdateDto } from "./dto";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {
	}

	async getAll(): Promise<User[]> {
		return await this.prisma.user.findMany();
	}

	async get(id: number): Promise<User> {
		await this.checkUser(id);

		return await this.prisma.user.findUnique({
			where: { id: id },
		});
	}

	async userExists(id: number): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id: id },
		});
		return user;
	}

	async getInfo(id: number, attribute: string) {
		await this.checkUser(id);

		const user = await this.prisma.user.findUnique({
			where: { id: id },
		});
		if (user == null)
			return ;
		return { attribute: user[attribute] };
	}

	async create(dto: UserCreateDto): Promise<User> {
		try {
			return await this.prisma.user.create({
				data: {
					name: dto.name,
					id: dto.id,
					avatar: dto.avatar,
				},
			});
		} catch (e) {
			if (e.code === 'P2002') {
				throw new HttpException({
					status: HttpStatus.BAD_REQUEST,
					error: `User ${dto.name} already exists`,
				}, HttpStatus.BAD_REQUEST);
			}
			throw e;
		}
	}

	async update(dto: UserUpdateDto): Promise<User> {
		await this.checkUser(dto.id);
		console.log(dto);
		return await this.prisma.user.update({
			where: { id: dto.id },
			data: dto,
		});
	}

	async checkUser(id: number) {
		if (await this.prisma.user.count({where: {id: id}}) == 0) {
			throw new HttpException({
				status: HttpStatus.BAD_REQUEST,
				error: `User ${id} doesn't exist`,
			}, HttpStatus.BAD_REQUEST);
		}
	}

}
