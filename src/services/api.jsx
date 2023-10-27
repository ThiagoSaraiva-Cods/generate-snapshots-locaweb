import axios from 'axios'

const apiLocaweb = axios.create({
	baseURL: 'https://api-servidores.locaweb.com.br/v1/vps/servers'
})

export default apiLocaweb
