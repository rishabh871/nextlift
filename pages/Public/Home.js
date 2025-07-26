import React,{useState,useRef,useEffect} from "react";
import styled from "styled-components";
import Head from "next/head";
import axios from "axios";
import {getServerProps} from "@utils/authUtils";
import {APP_NAME,API_STATUS,BASE_URL,WIDTH, DEFAULT_IMAGE_URL} from "@constants/Common";
import {plusIcon,minusIcon,rightArrow} from "@helpers/Icons";
import colors from "@constants/Colors";
import Frontend from "@components/Layouts/Frontend";
import {PAGES} from "@constants/ApiConstant";
import {Splide,SplideSlide} from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
const Wrapper = styled.div`
    width:100%;margin:0 auto;box-sizing:border-box;
    & .inner{max-width:1280px;width:100%;margin:0 auto;padding:0 20px;box-sizing:border-box;}
    & .banner-wrap{
        width:100%;background-color:#EFEAE2;background-image:url(${BASE_URL}/assets/images/banner-bg.png);background-size:contain;background-repeat:no-repeat;background-position:top;padding:120px 0;
        & .banner-inner{
            & .heading{font-size:42px;color:${colors.WHITE};text-align:center;margin:0 auto 20px;font-family:"Krona One",sans-serif;}
                & .text{font-size:16px;color:${colors.WHITE};line-height:28px;text-align:center;max-width:520px;margin:0 auto;}
                & .btn-wrap{
                    display:flex;gap:10px;margin-top:30px;justify-content:center;
                    & .btn{
                        font-size:16px;display:flex;align-items:center;gap:10px;padding:18px 30px;border-radius:14px;cursor:pointer;
                        &.green{background:#00BF62;color:${colors.DARK_BLACK};}
                        &.normal{background:none;color:${colors.WHITE};text-decoration:underline;}
                    }
                }
                & .image-wrap{
                    margin-top:40px;position:relative;
                    & .img-big{display:flex;width:100%;}
                    & .img-small{display:flex;width:220px;position:absolute;right:-140px;bottom:70px;}
                }
                & .b-text{
                    font-size:22px;color:${colors.DARK_BLACK};line-height:38px;text-align:center;max-width:1100px;margin:0 auto;font-family:"Krona One",sans-serif;
                    & strong{color:#00BF62;font-weight:500;}
                }
            }
        }
    }
    & .about-wrap{
        width:100%;background:${colors.WHITE};padding:60px 0;
        & .about-inner{
            display:flex;gap:30px;align-items:center;
            & .content-wrap{
                width:50%;
                & .heading{font-size:42px;color:${colors.DARK_BLACK};max-width:380px;margin-bottom:20px;font-family:"Krona One",sans-serif;}
                & .text{
                    font-size:16px;color:${colors.DARK_BLACK};line-height:28px;
                    & strong{color:#00BF62;font-weight:500;}
                }
                & .btn-wrap{
                    display:flex;gap:10px;margin-top:30px;
                    & .btn{
                        font-size:16px;display:flex;align-items:center;gap:10px;padding:18px 30px;border-radius:14px;cursor:pointer;
                        &.green{background:#00BF62;color:${colors.DARK_BLACK};}
                        &.normal{background:none;color:${colors.DARK_BLACK};text-decoration:underline;}
                    }
                }
            }
            & .image-wrap{
                width:50%;
                & .img{display:flex;width:100%;max-width:600px;}
            }
        }
    }
    & .work-wrap{
        padding:100px 0;background:${colors.WHITE};
        & .head{
            & .heading{font-size:42px;color:${colors.DARK_BLACK};text-align:center;margin-bottom:20px;font-family:"Krona One",sans-serif;}
            & .text{font-size:16px;color:${colors.DARK_BLACK};line-height:28px;text-align:center;max-width:1000px;margin:0 auto;}
        }
        & .work-inner{
            display:flex;margin-top:50px;gap:30px;
            & .image-wrap{
                width:50%;
                & .img{display:flex;width:100%;max-width:530px;}
            }
            & .content-wrap{
                width:50%;display:flex;flex-direction:column;gap:15px;
                & .item{
                    border:1px solid ${colors.DARK_BLACK};border-radius:8px;padding:20px;
                    & .title{font-size:18px;color:${colors.DARK_BLACK};margin-bottom:10px;font-family:"Krona One",sans-serif;}
                    & .text{font-size:14px;line-height:22px;color:${colors.DARK_BLACK};}
                    &.active{
                        border:1px solid ${colors.GREEN};
                        & .title{font-size:18px;color:${colors.GREEN};margin-bottom:10px;}
                    }
                }
            }
        }
    }
    & .faq-wrap{
        width:100%;background:${colors.WHITE};
        & .faq-inner{
            max-width:${WIDTH};background:#171717;padding:100px 0;margin:0 auto;border-radius:40px;
            & .heading{font-size:42px;color:${colors.WHITE};text-align:center;margin-bottom:20px;font-family:"Krona One",sans-serif;}
            & .faq-items{
                display:flex;flex-direction:column;gap:15px;width:100%;margin-top:20px;
                & .faq-item{
                    border:1px solid ${colors.WHITE};border-radius:8px;
                    &.active{
                        border-color:${colors.GREEN};
                        & .question{
                            color:${colors.GREEN};
                            & svg{fill:${colors.GREEN};}
                        }
                    }
                    & .question{
                        font-size:18px;cursor:pointer;padding:20px;display:flex;align-items:center;column-gap:15px;justify-content:space-between;color:${colors.WHITE};font-weight:600;font-family:"Krona One",sans-serif;
                        & .faq-btn{background:none;border:none;padding:0;cursor:pointer;}
                    }
                    & .answer{font-size:16px;line-height:22px;padding:0 30px 20px;color:${colors.WHITE};}
                }
            }
            & .btn-wrap{
                display:flex;gap:10px;margin-top:30px;justify-content:center;
                & .btn{
                    font-size:16px;display:flex;align-items:center;gap:10px;padding:18px 30px;border-radius:14px;cursor:pointer;
                    &.normal{background:none;color:${colors.WHITE};text-decoration:underline;}
                }
            }
        }
    }
    & .testimonial-wrap{
        padding:100px 0;background:${colors.WHITE};
        & .testimonial-inner{
            & .top{
                & .heading-big{font-size:100px;opacity:20%;color:#00000000;text-align:center;font-family:"Bebas Neue", sans-serif;-webkit-text-stroke:1px #000;stroke:#000;font-family:"Krona One",sans-serif;}
                & .heading{font-size:40px;font-weight:600;color:#36499B;text-align:center;margin-top:-40px;font-family:"Krona One",sans-serif;}
            }
            & .bottom{
                margin-top:60px;
                & .item{
                    display:flex;gap:30px;align-items:center;max-width:720px;margin:0 auto;position:relative;
                    & .testi-img{display:flex;position:absolute;top:0;right:50px;}
                    & .img{display:flex;width:100%;width:330px;height:375px;object-fit:cover;}
                    & .info{
                        & .desc{font-size:16px;line-height:26px;color:${colors.BLACK};margin-bottom:20px;}
                        & .name{font-size:18px;font-weight:600;color:#36499B;margin-bottom:8px;font-family:"Krona One",sans-serif;}
                        & .text{font-size:14px;color:${colors.DARK_BLACK};}
                    }
                }
            }
            & .btn-wrap{
                display:flex;gap:10px;margin-top:50px;justify-content:center;
                & .btn{
                    font-size:16px;display:flex;align-items:center;gap:10px;padding:18px 30px;border-radius:25px;cursor:pointer;border:none;width:110px;justify-content:center;
                    &.green{background:#00BF62;color:${colors.WHITE};}
                    &.black{background:${colors.DARK_BLACK};color:${colors.WHITE};}
                }
            }
        }
    }
    & .blog-wrap{
        padding:100px 0;background:#EFEAE2;
        & .head{
            & .heading{font-size:42px;color:${colors.DARK_BLACK};text-align:center;margin-bottom:20px;font-family:"Krona One",sans-serif;}
        }
        & .body{
            display:flex;gap:30px;margin-top:30px;
            & .item{
                flex:1;
                & .img{display:flex;width:100%;height:325px;object-fit:cover;border-radius:20px;overflow-hidden;cursor:pointer;margin-bottom:20px;}
                & .info-wrap{
                    display:flex;gap:30px;
                    & .text{font-size:14px;color:${colors.DARK_BLACK};}
                }
                & .heading{font-size:17px;font-weight:600;color:${colors.DARK_BLACK};line-height:22px;margin-top:10px;display:inline-block;}
            }
        }
        & .btn-wrap{
            display:flex;margin-top:30px;
            & .btn{
                font-size:16px;color:${colors.WHITE};text-transform:uppercase;cursor:pointer;background:${colors.RED};margin:0 auto;padding:18px 45px;letter-spacing:2px;transition:.2s;
                &:hover{background:${colors.DARK_BLACK};}
            }
        }
    }
    @media(max-width:991px){
        & .banner-wrap{
            padding:40px 0;
            & .banner-inner{
                & .heading{font-size:32px;margin:0 auto 15px;}
                & .btn-wrap{margin-top:20px;}
                & .image-wrap{
                    margin-top:30px;
                    & .img-big{max-width:600px;margin:0 auto;}
                }
            }
        }
        & .about-wrap{
            padding:40px 0;
            & .about-inner{
                gap:20px;
                & .content-wrap{
                    width:50%;
                    & .heading{font-size:28px;margin-bottom:8px;}
                    & .text{font-size:16px;line-height:28px;}
                    & .btn-wrap{
                        margin-top:15px;
                        & .btn{font-size:14px;gap:8px;padding:12px 20px;}
                    }
                }
                & .image-wrap{
                    width:50%;
                    & .img{display:flex;width:100%;max-width:600px;}
                }
            }
        }
        & .work-wrap{
            padding:40px 0;
            & .head{
                & .heading{font-size:28px;margin-bottom:8px;}
            }
            & .work-inner{margin-top:30px;gap:20px;}
        }
        & .faq-wrap{
            & .faq-inner{
                padding:40px 0;
                & .heading{font-size:28px;margin-bottom:8px;}
            }
        }
        & .testimonial-wrap{
            padding:40px 0;
            & .testimonial-inner{
                & .top{
                    & .heading-big{font-size:80px;}
                    & .heading{font-size:28px;margin-top:-28px;}
                }
            }
        }
    }
    @media(max-width:530px){
        & .banner-wrap{background-size:700px;}
    }
    @media(max-width:767px){
        & .banner-wrap{
            padding:30px 0;
            & .banner-inner{
                & .heading{font-size:28px;margin:0 auto 8px;}
                & .text{font-size:14px;line-height:22px;}
                & .btn-wrap{
                    margin-top:10px;
                    & .btn{font-size:14px;padding:12px 20px;}
                }
                & .image-wrap{
                    margin-top:30px;
                    & .img-big{max-width:360px;}
                }
                & .b-text{font-size:14px;line-height:22px;}
            }
        }
        & .about-wrap{
            padding:20px 0;
            & .about-inner{
                flex-direction:column;gap:20px;
                & .content-wrap{
                    width:100%;
                    & .heading{font-size:28px;text-align:center;margin:0 auto 8px;}
                    & .text{font-size:14px;line-height:24px;text-align:center;}
                    & .btn-wrap{
                        justify-content:center;
                        & .btn{font-size:14px;gap:8px;padding:12px 20px;}
                    }
                }
                & .image-wrap{
                    width:100%;
                    & .img{max-width:360px;margin:0 auto;}
                }
            }
        }
        & .work-wrap{
            padding:30px 0;
            & .head{
                & .heading{font-size:28px;margin-bottom:8px;}
            }
            & .work-inner{
                flex-direction:column;margin-top:20px;
                & .image-wrap{
                    width:100%;
                    & .img{max-width:360px;margin:0 auto;}
                }
                & .content-wrap{
                    width:100%;column;gap:10px;
                    & .item{
                        padding:15px;
                        & .title{font-size:16px;margin-bottom:6px;}
                    }
                }
            }
        }
        & .faq-wrap{
            & .faq-inner{
                padding:30px 0;border-radius:0;
                & .heading{font-size:28px;margin-bottom:8px;}
                & .faq-items{
                    gap:10px;
                    & .faq-item{
                        & .question{
                            font-size:16px;padding:15px;column-gap:15px;
                            & .faq-btn{
                                & svg{width:16px;height:16px;}
                            }
                        }
                        & .answer{font-size:14px;line-height:20px;padding:0 20px 10px;}
                    }
                }
                & .btn-wrap{
                    margin-top:15px;
                    & .btn{font-size:14px;padding:12px 20px;}
                }
            }
        }
        & .testimonial-wrap{
            padding:30px 0;
            & .testimonial-inner{
                & .top{
                    & .heading-big{font-size:36px;}
                    & .heading{font-size:19px;margin-top:-10px;}
                }
                & .bottom{
                    margin-top:30px;
                    & .item{
                        flex-direction:column;display:flex;gap:30px;align-items:center;max-width:720px;margin:0 auto;
                        & .img{width:240px;height:325px;}
                        & .testi-img{width:80px;top:-10px;right:0;}
                        & .info{
                            & .desc{font-size:14px;line-height:22px;margin:0 auto 10px;text-align:center;max-width:400px;}
                            & .name{font-size:16px;font-weight:600;margin-bottom:6px;text-align:center;}
                            & .text{font-size:14px;text-align:center;}
                        }
                    }
                }
                & .btn-wrap{
                    margin-top:15px;
                    & .btn{font-size:14px;padding:12px 20px;width:90px;}
                }
            }
        }
    }
`;
const HomePage = ({pageData}) => {
    const [activeIndex,setActiveIndex] = useState(0);
    const splideRef = useRef(null);
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
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
    const sliderOptions = {
        type: "loop",
        autoplay: true,
        interval: 3000,
        pauseOnHover: true,
        arrows: false,
        pagination: false,
        perPage: 1
    }
    const goToNext = () => {
        splideRef.current.splide.go('>');
    }
    const goToPrev = () => {
        splideRef.current.splide.go('<');
    }
    return (
        <React.Fragment>
            <Head>
                <title>{pageData.meta_title}</title>
                <meta name="description" content={pageData.meta_description}/>
                <meta name="keywords" content=""/>
                <meta name="author" content={APP_NAME}/>
                <meta property="og:type" content="website"/>
                <meta property="og:title" content={pageData.meta_title}/>
                <meta property="og:description" content={pageData.meta_description}/>
                <meta property="og:url" content={BASE_URL}/>
                <meta property="og:site_name" content={APP_NAME}/>
                <meta property="og:image" content={`${BASE_URL}/assets/images/logo.png`}/>
                <link rel="canonical" href={BASE_URL}/>
            </Head>
            <Frontend page="home">
                <Wrapper>
                    <div className="banner-wrap">
                        <div className="inner">
                            <div className="banner-inner">
                                <div className="heading">{pageData.page_components.s1_heading}</div>
                                <div className="text">{pageData.page_components.s1_sub_heading}</div>
                                <div className="btn-wrap">
                                    <a className="btn green" href={`${BASE_URL}${pageData.page_components.s1_button_1_url}`}>
                                        {pageData.page_components.s1_button_1_text}
                                        {rightArrow({width: 14,height: 12,fill: colors.DARK_BLACK})}
                                    </a>
                                    <a className="btn normal" href={`${BASE_URL}${pageData.page_components.s1_button_2_url}`}>
                                        {pageData.page_components.s1_button_2_text}
                                        {rightArrow({width: 14,height: 12,fill: colors.WHITE})}
                                    </a>
                                </div>
                                <div className="image-wrap">
                                    <img src={pageData.page_components.s1_image || DEFAULT_IMAGE_URL} alt="Banner" className="img-big"/>
                                </div>
                                <div className="b-text" dangerouslySetInnerHTML={{__html: pageData.page_components.s1_description}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="about-wrap">
                        <div className="inner">
                            <div className="about-inner">
                                <div className="content-wrap">
                                    <div className="heading">{pageData.page_components.s2_heading}</div>
                                    <div className="text"  dangerouslySetInnerHTML={{__html: pageData.page_components.s2_description}}></div>
                                    <div className="btn-wrap">
                                        <a className="btn green" href={`${BASE_URL}${pageData.page_components.s2_button_1_url}`}>
                                            {pageData.page_components.s2_button_1_text}
                                            {rightArrow({width: 14,height: 12,fill: colors.DARK_BLACK})}
                                        </a>
                                        <a className="btn normal" href={`${BASE_URL}${pageData.page_components.s2_button_2_url}`}>
                                            {pageData.page_components.s2_button_2_text}
                                            {rightArrow({width: 14,height: 12,fill: colors.DARK_BLACK})}
                                        </a>
                                    </div>
                                </div>
                                <div className="image-wrap">
                                    <img src={pageData.page_components.s2_image || DEFAULT_IMAGE_URL} alt="About Us" className="img"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="work-wrap">
                        <div className="inner">
                            <div className="head">
                                <div className="heading">{pageData.page_components.s3_heading}</div>
                                <div className="text">{pageData.page_components.s3_description}</div>
                            </div>
                            <div className="work-inner">
                                <div className="image-wrap">
                                    <img src={pageData.page_components.s3_image || DEFAULT_IMAGE_URL} alt="How It Works" className="img"/>
                                </div>
                                <div className="content-wrap">
                                    {pageData.page_components.s3_features.map((feature,index) => (
                                        <div className="item" key={index}>
                                            <div className="title">{feature.heading}</div>
                                            <div className="text">{feature.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="faq-wrap">
                        <div className="faq-inner">
                            <div className="inner">
                                <div className="heading">Frequently Asked Questions</div>
                                <div className="faq-items">
                                    {pageData.faqs.map((faq,index) => (
                                        <div className={`faq-item ${(activeIndex === index) ? 'active' : ''}`} key={index}>
                                            <div className="question" onClick={() => toggleFaq(index)}>
                                                {index + 1}.  {faq.question}
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
                                <div className="btn-wrap">
                                    <a className="btn normal" href={`${BASE_URL}/faqs`}>
                                        Learn more
                                        {rightArrow({width: 14,height: 12,fill: colors.WHITE})}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-wrap">
                        <div className="inner">
                            <div className="testimonial-inner">
                                <div className="top">
                                    <div className="heading-big">{pageData.page_components.s4_heading}</div>
                                    <div className="heading">{pageData.page_components.s4_sub_heading}</div>
                                </div>
                                <div className="bottom">
                                    <Splide ref={splideRef} options={sliderOptions}>
                                        {pageData.page_components.s4_testimonials.map((testimonial,index) => (
                                            <SplideSlide key={index}>
                                                <div className="item">
                                                    <img src={testimonial.image || DEFAULT_IMAGE_URL} alt={testimonial.name} className="img"/>
                                                    <img src={`${BASE_URL}/assets/images/testimonials.png`} alt="Testimonials" className="testi-img"/>
                                                    <div className="info">
                                                        <div className="desc">{testimonial.content}</div>
                                                        <div className="name">{testimonial.name}</div>
                                                        <div className="text">{testimonial.location}</div>
                                                    </div>
                                                </div>
                                            </SplideSlide>
                                        ))}
                                    </Splide>
                                </div>
                                <div className="btn-wrap">
                                    <button className="btn green" onClick={goToPrev}>Previous</button>
                                    <button className=" btn black" onClick={goToNext}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Wrapper>
            </Frontend>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    let pageData = null;
    try{
        const {data} = await axios.get(`${PAGES.WEBPAGE}/home`);
        if(data.status == API_STATUS.SUCCESS){
            pageData = data.page;
        }else if(data.status == API_STATUS.PRECONDITION_FAILED){
            return handleForbidden(context.res);
        }
    }catch(e){}
    return getServerProps(context,{pageData});
}
export default HomePage;