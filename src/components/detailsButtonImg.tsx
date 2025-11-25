import constants from "../store/constants";
 

interface DetailsButtonImgProps {
	id: string;
}

const detailsButtonImg = ({ id }: DetailsButtonImgProps) => {

 	return (
		<>
			<div className="detailsImage">
				<img src={`${constants.SERVER_URL}/api/get_svg/${id}`} alt={"img"} />
			</div>
		</>
	);
};

export default detailsButtonImg;


