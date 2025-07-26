import PropTypes from 'prop-types';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

/**
 * A helper function for displaying SweetAlerts with customizable options.
 *
 * @param {object} props - The properties for configuring the SweetAlert.
 * @param {string} props.message - The message to be displayed in the SweetAlert.
 * @param {string} props.icon - The icon type for the SweetAlert (e.g., 'success', 'error').
 * @param {string} [props.confirmButtonText="Confirm"] - The text for the confirm button.
 * @param {string} [props.confirmButtonColor] - The color for the confirm button.
 * @param {boolean} [props.showCancelButton=false] - Whether to show the cancel button.
 * @param {string} [props.cancelButtonText="No"] - The text for the cancel button.
 * @param {string} [props.cancelButtonColor] - The color for the cancel button.
 * @param {boolean} [props.allowOutsideClick=false] - Whether to allow clicking outside the SweetAlert.
 */
const sweetAlert = (props) => MySwal.fire({
    html: props.message,
    icon: props.icon,
    confirmButtonText: props.confirmButtonText || "Yes",
    showCancelButton: props.showCancelButton || false,
    cancelButtonText: props.cancelButtonText || "No",
    allowOutsideClick: props.allowOutsideClick || false,
    ...props
});

/**
 * Define PropTypes for type checking
 */
sweetAlert.propTypes = {
    message: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    confirmButtonText: PropTypes.string,
    confirmButtonColor: PropTypes.string,
    showCancelButton: PropTypes.bool,
    cancelButtonText: PropTypes.string,
    cancelButtonColor: PropTypes.string,
    allowOutsideClick: PropTypes.bool,
};
export default sweetAlert;