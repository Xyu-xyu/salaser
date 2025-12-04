import constants from "../store/constants";



const detailsButtonImg = ({ id }) => {

 	return (
		<>
			<div className="detailsImage">
				<img src={`${constants.SERVER_URL}/api/get_svg/${id}`} alt={"img"} />
			</div>
		</>
	);
};

export default detailsButtonImg;


