import { useState } from 'react'

import api from '../../services/api' // Importação do módulo de serviços de API personalizado
import * as H from './styles' // Importação de estilos personalizados para o componente

const configHeaders = {
	'X-User-Token': '', // Inserir o token gerado na locaweb, gera o token na url: https://servidores.locaweb.com.br/integrations/secret_key
	'X-User-Login': '', // Login utilizado para logar na locaweb
	'Content-Type': 'application/json',
	Accept: 'application/json'
}

// Componente principal que exibe uma lista de servidores e suas respectivas snapshots.
function Home() {
	// Definição dos estados locais
	const [vpsListing, setVpsListing] = useState([]) // Estado para armazenar a lista de servidores
	const [snapshotListing, setSnapshotListing] = useState([]) // Estado para armazenar a lista de snapshots
	const [deletedCount, setDeletedCount] = useState(0) // Contador para snapshots deletadas
	const [generatedCount, setGeneratedCount] = useState(0) // Contador para snapshots geradas

	// Função assíncrona para buscar os servidores e suas respectivas snapshots
	const fetchServers = async () => {
		try {
			// Chamada à API para obter a lista de servidores
			const response = await api.get('/', { headers: configHeaders })
			setVpsListing(response.data.data)
			const urls = response.data.data.map(vps => `/${vps.id}/snapshots`)

			// Monta as URLs para buscar as snapshots de cada servidor e busca as snapshots
			const snapshots = await Promise.all(urls.map(url => fetchSnapshots(url)))
			setSnapshotListing(snapshots.flat())
		} catch (error) {
			console.log(error)
		}
	}

	// Função assíncrona para buscar as snapshots de um servidor específico
	const fetchSnapshots = async url => {
		try {
			if (url) {
				const response = await api.get(url, { headers: configHeaders })
				const serverId = url.match(/\/(.*)\/snapshots/)[1]
				return response.data.data.map(snapshot => ({
					serverId,
					snapshotId: snapshot.id
				}))
			}
		} catch (error) {
			console.log(error)
		}
	}

	// Função assíncrona para deletar snapshots
	const deleteSnapshots = async () => {
		try {
			await Promise.all(
				snapshotListing.map(async snapshot => {
					const url = `/${snapshot.serverId}/snapshots/${snapshot.snapshotId}`
					const response = await api.delete(url, { headers: configHeaders })
					if (response.status === 204) {
						setDeletedCount(prev => prev + 1) // Incrementa o contador de snapshots deletadas
						console.log(
							`Snapshot com ID ${snapshot.snapshotId} do servidor com ID ${snapshot.serverId} deletado com sucesso.`
						)
					}
				})
			)
		} catch (error) {
			console.error('Erro ao deletar snapshots:', error)
		}
	}

	// Função assíncrona para gerar snapshots com o nome baseado no horário atual
	const generateSnapshots = async () => {
		try {
			const now = new Date().toISOString()
			await Promise.all(
				vpsListing.map(async vps => {
					const data = {
						data: {
							type: 'snapshots',
							attributes: { name: now }
						}
					}
					const response = await api.post(`/${vps.id}/snapshots`, data, {
						headers: configHeaders
					})
					if (response.status === 201) {
						setGeneratedCount(prev => prev + 1) // Incrementa o contador de snapshots geradas
						console.log(`Snapshot gerado para o servidor com ID ${vps.id}.`)
					}
				})
			)
		} catch (error) {
			console.error('Erro ao gerar snapshots:', error)
		}
	}

	// Função que aciona todas as requisições em sequência
	const handleButtonClick = async () => {
		try {
			await fetchServers()
			await fetchSnapshots()
			await deleteSnapshots()
		} catch (error) {
			console.error('Erro durante o processamento:', error)
		}
	}

	// Renderização do componente
	return (
		<H.Container>
			<div>
				{/* Exibir mensagem quando deletar todas as snapshots do array retornado pela requisição get */}
				{deletedCount === snapshotListing.length && deletedCount > 0 && (
					<p>Snapshots deletadas com sucesso!</p>
				)}

				{/* Exibir mensagem quando Gerar todas as snapshots do array retornado pela requisição get */}
				{generatedCount === vpsListing.length && generatedCount > 0 && (
					<p>Snapshots geradas com sucesso!</p>
				)}
				<button onClick={handleButtonClick}>Deletar Snapshots</button>
				<button onClick={generateSnapshots}>Gerar Snapshots</button>
			</div>
		</H.Container>
	)
}

export default Home // Exportação do componente principal
