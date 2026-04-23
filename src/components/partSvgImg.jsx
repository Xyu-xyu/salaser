import constants from "../store/constants";

const PartSvgImg = ({ uuid, updated_at, alt = "part", ...imgProps }) => {
	if (!uuid || !constants.SERVER_URL) return null;

	const src = `${constants.SERVER_URL}/jdb/get_part_svg/${encodeURIComponent(
		String(uuid)
	)}?v=${encodeURIComponent(String(updated_at ?? ""))}`;

	return <img src={src} alt={alt} {...imgProps} />;
};

export default PartSvgImg;

