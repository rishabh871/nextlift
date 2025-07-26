import styled from "styled-components";
import colors from '@constants/Colors';
const Heading = styled.h1`
    padding: ${props => props.padding || 0};
    margin: ${props => props.margin || 0};
    font-size: ${props => props.size || '24px'};
    line-height: ${props => props.height || '28px'};
    font-weight: ${props => props.weight || 600};
    color: ${props => props.color || colors.WHITE};
    text-align: ${props => props.align || 'unset'};
    text-transform: ${props => props.textTransform || 'none'};

    @media(max-width: 767px){
        padding: ${props => props.r767Padding || 0};
        margin: ${props => props.r767Margin || 0};
        font-size: ${props => props.r767Size || '20px'};
        line-height: ${props => props.r767Height || '26px'};
    }
`;
export default Heading;