import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'

export function initSocket() {
	let originalHost = window.location.hostname
	let host = import.meta.env.DEV ? 'localhost' : originalHost
	let siteName = window.site_name || originalHost
	let port = window.location.port ? `:${socketio_port}` : ''
	let protocol = port ? 'http' : 'https'
	let url = `${protocol}://${host}${port}/${siteName}`

	let socket = io(url, {
		withCredentials: true,
		reconnectionAttempts: 5,
	})
	return socket
}
