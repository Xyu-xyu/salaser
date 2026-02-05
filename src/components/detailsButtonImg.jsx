 import constants from "../store/constants"

const DetailsButtonImg = ({ id, updated_at }) => {

	const src = `${constants.SERVER_URL}/api/get_svg/${id}?v=${updated_at}`

	return (
		<>
			<img
				src={src}
				alt="img"
			/>
		</>
	)
}

export default DetailsButtonImg

