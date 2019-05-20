const express = require('express')
const axios = require('axios')
const app = express()

const PORT = process.env.PORT || 5000

app.use(express.static('public'))

/**
 * Retrieve a GeoJSON list of stores for a specific area
 *
 * @param lat       latitude
 * @param lng       longitude
 * @param limit     listing limit
 */
app.get('/stores', (req, res) => {

	const latitude = req.query.lat || 40.78
	const longitude = req.query.lng || -73.97
	const limit = req.query.limit || 50

	axios.get(`https://api.doordash.com/v2/store_search/?offset=0&lat=${latitude}&lng=${longitude}&limit=${limit}`)
		.then(async response => {

			const storePromises = response.data.stores.map(async store => {
				const response = await axios.get(`https://api.doordash.com/v1/stores/${store.id}/?fields=cover_img_url,address`)

				return {
					id: store.id,
					name: store.name,
					img: response.data.cover_img_url,
					url: store.url,
					avg_rating: store.average_rating,
					num_rating: store.num_ratings,
					address: response.data.address.printable_address,
					lat: response.data.address.lat,
					lng: response.data.address.lng
				}
			})

			return await Promise.all(storePromises)
		})
		.then(stores => _convertToGeoJson(stores))
		.then(geoJson => res.send(geoJson))
		.catch(err => {
			console.error(err)
			res.sendStatus(500)
		})
})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))

/* Private helper methods */

function _convertToGeoJson(storesJson) {
	const stores = storesJson.map(store => {
		return {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [store.lng, store.lat]
			},
			properties: store
		}
	})

	return {
		type: 'FeatureCollection',
		features: stores
	}
}