import React, { useEffect, useState, useRef, useContext} from 'react'
import { Link } from 'react-router-dom'
import User, { id_to_user } from '../utils/User'
import NavBar from '../Components/NavBar'
import '../Home/Dashboard.css'
import { ReactP5Wrapper } from 'react-p5-wrapper'
import sketch from './sketches/sketch'
import { io, Socket } from 'socket.io-client';
import './Game.css'
import { AuthContext } from '../../App'
import axios, { AxiosResponse, AxiosError } from 'axios'

const BALL_SIZE = 10;
const BALL_SPEED = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 20;

const { v4: uuidv4 } = require('uuid');

type GamePost = {
	user_id: number,
	target_id: number,
}

export let socket_game: Socket

function Game() {

	const [isJoined, setIsJoined] = useState(false);
	const { state, dispatch } = useContext(AuthContext);
	const [data, setData] = useState(null);
	let game_id: Number;

	const connect = () => {
		socket_game = io(`http://${window.location.hostname}:8080/game`,
		{
			extraHeaders: {
				Authorization: "Bearer " + localStorage.getItem('token')
			}
		});
		socket_game.on("connect", () => {
			console.log("Connected to game");
			console.log(socket_game);
		});

		const body: GamePost = {
			user_id: Number(state.user.id),
			target_id: 4,
		}

		axios.post('/api/game/create', body)
			.then((response: AxiosResponse) => {
				console.log('Received message :', response);
				game_id = response.data.id;

				const join_dto = {
					user_id: state.user.id,
					target_id: 4,
					id: game_id
				};

				socket_game.on('update', (dto) => {
					setData(dto);
				});

				socket_game.on('join', (res) => {
					console.log(`join: ${res.id}`);
				});
				socket_game.emit('join', join_dto);
			});
	}

	useEffect(() => {
		let isKeyPressed = false;

		const handleKeyEvent = (event: KeyboardEvent, action: string) => {
			let keyEvent = {
				action: action,
				key: ""
			};

			if (event.key === "ArrowUp" || event.key === "w") {
				keyEvent.key = "Up";
			} else if (event.key === "ArrowDown" || event.key === "s") {
				keyEvent.key = "Down";
			} else {
				return ;
			}

			const key_data = {
				"id": game_id,
				"user_id": Number(state.user.id),
				"keyEvent": keyEvent,
			}
			socket_game.emit("keyEvent", key_data);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (isKeyPressed)
			return ;
			isKeyPressed = true;
			handleKeyEvent(event, "Press");
		}

		const handleKeyUp = (event: KeyboardEvent) => {
			isKeyPressed = false;
			handleKeyEvent(event, "Release");
		}

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {

			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	const handleJoinGame = async () => {
		// Appel à la fonction pour rejoindre la partie
		try {
			await connect();
			setIsJoined(true);
		} catch (error) {
			console.log(error);
		}
	};

	if (!isJoined) {
		return (
			<div className="dashboard">
			<NavBar /> 
				<div>
					<button onClick={handleJoinGame}>Rejoindre la partie</button>
				</div>
			</div>
		);
	} else {
		return (
			<div className="dashboard">
			<NavBar /> 
				<div id="game" style={{position: 'relative', overflow: 'hidden'}}>
					<ReactP5Wrapper sketch={sketch} data={data}></ReactP5Wrapper>
				</div>
			</div>
		);
	}
}

export default Game;
