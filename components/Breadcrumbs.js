import styled from 'styled-components';
import colors from '@constants/Colors';
import {BASE_URL} from '@constants/Common';
const Wrapper = styled.div`
    padding:140px 40px;box-sizing:border-box;width:100%;display:flex;flex-direction:column;
    background:url(${props => props.bgImage || "/assets/images/breadcrumbs.jpg"});background-position:center center;background-size:cover;position:relative;
    & h1{font-size:36px;line-height:1.2;color:${colors.WHITE};z-index:1;margin:0 0 8px;font-family:"Krona One",sans-serif;}
    & .breadcrumbs{
        z-index:1;
        & a{
            text-transform:uppercase;font-weight:500;font-size:14px;color:${colors.WHITE};text-decoration:none;transition:all .25s ease;
            &:hover{color:${colors.WHITE}b3;}
        }
        & span{
            text-transform:uppercase;font-weight:500;font-size:14px;color:${colors.WHITE};text-decoration:none;transition:all .25s ease;
            &.seperator{margin:0 8px;}
        }
    }
    @media(max-width:991px){
        padding:80px 20px;
        & h1{font-size:28px;}
    }
    @media(max-width:767px){
        padding:60px 20px;
        & h1{font-size:22px;}
    }
`;
const Breadcrumbs = ({title,bgImage = null}) => {
    return (
        <Wrapper bgImage={bgImage}>
            <h1>{title}</h1>
            <div className="breadcrumbs">
                <a href={BASE_URL}>Home</a>
                <span className="seperator">/</span>
                <span className="current">{title}</span>
            </div>
        </Wrapper>
    );
}
export default Breadcrumbs;