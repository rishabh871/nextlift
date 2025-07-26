import React,{useState} from "react";
import styled from "styled-components";
import {Splide,SplideSlide} from "@splidejs/react-splide";
import {WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
import {DEFAULT_IMAGE_URL,SLIDER_OPTIONS} from "@constants/Common";
import {plusIcon,minusIcon} from "@helpers/Icons";
import ContactWrap from "@components/Contacts";
import FrontImage from "@helpers/FrontImage";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
const Wrapper = styled.div`
    max-width:${WIDTH};width:100%;margin:0 auto;padding:50px 20px;box-sizing:border-box;
    & .main-content{
        box-sizing:border-box;display:flex;flex-direction:column;gap:30px;
        & .editor-container{
            display:flex;gap:30px;box-sizing:border-box;
            & .column{
                flex:1;position:relative;
                & .image-wrap{display:flex;position:relative;border-radius:10px;overflow:hidden;min-height:300px;height:100%;}
                & .inner{
                    display:flex;flex-direction:column;
                    & h1{font-size:24px;line-height:28px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & h2{font-size:20px;line-height:25px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & h3{font-size:20px;line-height:25px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & h4{font-size:18px;line-height:22px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & h5{font-size:17px;line-height:22px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & h6{font-size:16px;line-height:22px;font-weight:600;color:${colors.BLACK};margin:0 0 10px;}
                    & div{font-size:16px;line-height:22px;color:${colors.BLACK};margin:0 0 10px;}
                    & p{
                        font-size:16px;color:${colors.BLACK};line-height:24px;margin:0 0 15px;
                        & strong:first-of-type{font-size:18px;}
                    }
                    & ol{
                        padding-left:25px;display:flex;flex-direction:column;gap:10px;margin:0 0 20px;
                        li{
                            font-size:16px;color:${colors.BLACK};line-height:28px;
                            & strong:first-of-type{font-size:18px;}
                        }
                    }
                    & ul{
                        padding-left:25px;display:flex;flex-direction:column;gap:10px;margin:0 0 20px;
                        li{
                            font-size:16px;color:${colors.BLACK};line-height:24px;
                            & strong:first-of-type{font-size:18px;}
                        }
                    }
                    & img{width:100%;max-height:350px;object-fit:cover;}
                }
            }
        }
    }
    & .faq-items{
        display:flex;flex-direction:column;gap:15px;width:100%;margin-top:20px;
        & .faq-item{
            border:1px solid ${colors.BORDER};border-radius:8px;
            &.active{
                border-color:${colors.GREEN};
                & .question{
                    color:${colors.GREEN};
                    & svg{fill:${colors.GREEN};}
                }
            }
            & .question{
                font-size:18px;cursor:pointer;padding:20px;display:flex;align-items:center;column-gap:15px;justify-content:space-between;color:${colors.BLACK};font-weight:600;
                & .faq-btn{background:none;border:none;padding:0;cursor:pointer;}
            }
            & .answer{font-size:16px;line-height:22px;padding:0 30px 20px;color:${colors.BLACK};}
        }
    }
    & .pricing-card-wrap{display:flex;column-gap:40px;box-sizing:border-box;margin-top:20px;}
    @media(max-width:767px){
        padding:30px 20px;
        & .faq-items{
            margin-top:0;gap:10px;
             & .faq-item{
                border:1px solid ${colors.BORDER};border-radius:8px;
                &.active{
                    border-color:${colors.GREEN};
                    & .question{
                        color:${colors.GREEN};
                        & svg{fill:${colors.GREEN};}
                    }
                }
                & .question{
                    font-size:16px;cursor:pointer;padding:15px 15px 6px;display:flex;align-items:center;column-gap:15px;justify-content:space-between;color:${colors.BLACK};font-weight:600;
                    & .faq-btn{
                        & svg{width:16px;height:16px;}
                    }
                }
                & .answer{font-size:14px;line-height:22px;padding:0 15px 15px;color:${colors.BLACK};}
            }
        }
        & .main-content{
            & .editor-container{flex-direction:column;}
        }
    }
`;
const Card = styled.div`
    padding-bottom:30px;position:relative;background:${colors.WHITE};width:100%;height:100%;border-radius:20px;transition:.2s;overflow:hidden;
    :hover{transform:translateY(-10px);}
    & .card-img{width:100%;}
    & .card-heading{
        text-align:center;
        & h2{margin:0;color:${colors.RED};font-weight:500;font-size:22px;}
        & hr.solid{
            display:block;border:0;width:90px;border-radius:10px;border-top:5px solid ${colors.RED};margin:15px auto 20px;padding:0;
        }
    }
    & .plan-price{
        margin-bottom:15px;
        & .price-wrap{
            font-size:14px;color:${colors.BLACK};margin:0;line-height:20px;text-align:center;
            & span{font-weight:600;font-size:18px;line-height:24px;}
        }
    }
    & .card-body{
        background:${colors.WHITE};border-radius:20px;position:relative;padding:20px 30px 0;
        & .card-desc{
            padding:20px 0 0 0;
            & h3{font-size:17px;color:${colors.BLACK};text-align:center;margin:0 0 10px;font-weight:500;}
            & ul{
                margin:0;list-style:none;color:${colors.BLACK};padding:0 0 0 15px;list-style:disc;
                & li{font-size:16px;line-height:24px;}
                & p{font-size:16px;line-height:22px;margin:5px 0 0px;;}
            }   
        }  
    }
    @media (max-width:1199px){
        & .card-body{padding:20px 30px 0 30px;margin-top:-20px;}
    }
    @media (max-width:991px){
        padding-bottom:5px;
        & .card-body{
            padding:20px;
            & .card-heading{
                & h2{font-size:18px}
                & hr.solid{margin:15px auto 15px;}
            }
            & .card-desc{
                & h3{font-size:14px;}
                & ul{
                    & li{font-size:14px;line-height:22px;}
                    & p{font-size:14px;line-height:22px;margin:0;}
                }
            }
        }
    }
    @media (max-width:767px){
        max-width:400px;width:100%;margin:auto;
        & .card-body{padding:25px;}
    }
`;
const PageWrap = ({pageData}) => {
    const [activeIndex,setActiveIndex] = useState(0);
    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    }
    const handleFaq = (index) => {
        if(activeIndex === index){
            setActiveIndex(null);
        }else{
            setActiveIndex(index);
        }
    }
    const renderHTML = (rawHTML) => {
        return (
            <div className='card-desc' dangerouslySetInnerHTML={{__html: rawHTML}}></div>
        )
    }
    const prepareComponentHtml = (component) => {
        if(component.type == "heading"){
            return `<${component.tag}>${component.text}</${component.tag}>`;
        }else if(component.type == "editor"){
            return component.text;
        }else if(component.type == "video"){
            return `<video src="${component.video}"></video>`;
        }
        return;
    }
    const options = {
        type: "slide",
        autoplay: false,
        interval: 3000,
        pauseOnHover: true,
        arrows: false,
        pagination: false,
        perPage: 3,
        perMove: 1,
        gap: "30px",
        breakpoints: {
            991: {arrows: true,perPage: 2},
            767: {arrows: true,perPage: 1}
        }
    }
    return (
        <>
            {pageData.template == "contacts" ? (
                <ContactWrap page={pageData}/>
            ) : (
                <Wrapper>
                    <div className="main-content">
                        {pageData.page_components.length > 0 ? (
                            <>
                                {pageData.page_components.map((pageComponent,componentIndex) => (
                                    <div className="editor-container" key={componentIndex}>
                                        {pageComponent.columns.map((component,columnIndex) => (
                                            <div className={`column col-${component.width}`} key={columnIndex}>
                                                {component.type == "image" ? (
                                                    <div className="image-wrap">
                                                        <FrontImage src={component.image ? component.image : DEFAULT_IMAGE_URL} alt="Image" layout="fill" objectFit="cover" fill/>
                                                    </div>
                                                ) : component.type == "editor" ? (
                                                    <div className="inner" dangerouslySetInnerHTML={{__html: component.text}}></div>
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </>
                        ) : null}
                    </div>
                    {pageData.template == "faqs" && pageData.faqs && pageData.faqs.length > 0 ? (
                        <div className="faq-items">
                            {pageData.faqs.map((faq,index) => (
                                <div className={`faq-item ${(activeIndex === index) ? 'active' : ''}`} key={index}>
                                    <div className="question" onClick={() => toggleFaq(index)}>
                                        {index + 1}. {faq.question}
                                        <button className="faq-btn" onClick={() => handleFaq(index)}>
                                            {activeIndex === index ? (
                                                minusIcon({width:24,height:24,fill:colors.WHITE})
                                            ) : (
                                                plusIcon({width:24,height:24,fill:colors.WHITE})
                                            )}
                                        </button>
                                    </div>
                                    {activeIndex === index && (
                                        <div className="answer">{faq.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : pageData.template == "pricing" && pageData.memberships && pageData.memberships.length > 0 ? (
                        <div className="pricing-card-wrap">
                            <Splide options={options}>
                                {pageData.memberships.map((plan,index) => (
                                    <SplideSlide>
                                        <Card key={index}>
                                            <img src={plan.banner || DEFAULT_IMAGE_URL} className="card-img" alt="player"/>
                                            <div className="card-body">
                                                <div className="card-heading">
                                                    <h2>{plan.name || ""}</h2>
                                                    <hr className="solid"/>
                                                </div>
                                                <div className="plan-price">
                                                    <div className="price-wrap"><span>{plan.price == 0 ? "Free" : `$${parseInt(plan.price)}`}</span> {plan.price ? "/ " + plan.type : ""}</div>
                                                </div>
                                                {plan.description ? renderHTML(plan.description) : ''}
                                            </div>
                                        </Card>
                                    </SplideSlide>
                                ))}
                            </Splide>
                        </div>
                    ) : null}
                </Wrapper>
            )}
        </>
    );
}
export default PageWrap;