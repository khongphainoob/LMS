import { io } from 'socket.io-client'

export function initSocket() {
    let siteName = window.frappe?.boot?.sitename || window.site_name || 'lms.test'
    // Ép sử dụng cổng 9001 để khớp với Docker
    let host = `${window.location.protocol}//localhost:9001` 

    let socket = io(`${host}/${siteName}`, {
        withCredentials: true,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'], // Ưu tiên websocket cho game mượt
        upgrade: true
    })
    return socket
}