import React from "react";
import styled from "styled-components";
import colors from "@constants/Colors";
import {APP_NAME,WIDTH} from "@constants/Common";
import {BASE_URL} from "@constants/Backend";
import {facebookIcon} from "@helpers/Icons";
const Wrap = styled.div`
    width:100%;box-sizing:border-box;width:100%;
    & .footer{
        background:${colors.DARK_BLACK};
        & .footer-inner{
            max-width:${WIDTH};width:100%;box-sizing:border-box;margin:0 auto;width:100%;padding:30px 20px;display:flex;column-gap:20px;
            & .footer-item{
                display:flex;flex-direction:column;row-gap:20px;flex:1;
                & .footer-item-inner{
                    & .logo-wrap{
                        margin-bottom:20px;
                        & .link{
                            display:flex;align-items:center;gap:10px;font-size:24px;font-weight:500;color:${colors.WHITE};
                            & .logo{display:flex;width:50px;}
                            & span{font-size:24px;font-weight:500;color:${colors.WHITE};}
                        }
                    }
                    & .heading{font-size:22px;color:${colors.WHITE};margin-bottom:30px;}
                    & .desc{font-size:16px;color:${colors.TEXT};line-height:24px;}
                    & .footer-lists{
                        list-style:none;padding:0;margin:0;display:flex;flex-direction:column;row-gap:10px;
                        & .footer-list{
                            & .footer-list-item{font-size:16px;color:${colors.TEXT};}
                            & :hover{color:${colors.GREEN};text-decoration:underline;}
                        }
                    }
                    & .social-wrap{
                        display:flex;column-gap:10px;
                        & .social-link{display:flex;align-items:center;justify-content:center;width:35px;height:35px;border-radius:4px;background:${colors.GREEN};transition:0.2s;}
                    }
                }
            }
        }
    }
    & .copyright{
        background:${colors.DARK_BLACK};
        & .inner-copyright{
            max-width:${WIDTH};width:100%;box-sizing:border-box;margin:0 auto;width:100%;padding:20px;display:flex;align-items:center;column-gap:20px;justify-content:center;
            & .copy{
                font-size:16px;font-weight:500;color:${colors.WHITE};
                & .app-name{color:${colors.GREEN};}
            }
        }
    }
    @media(max-width:991px){
        & .footer{
            & .footer-inner{
                flex-wrap:wrap;gap:20px;
                & .footer-item{flex:unset;width:calc(50% - 10px);}
            }
        }
    }
    @media(max-width:767px){
        & .footer{
            & .footer-inner{
                flex-direction:column;row-gap:25px;
                & .footer-item{
                    width:100%;
                    & .footer-item-inner{
                        & .heading{font-size:20px;margin-bottom:15px;}
                    }
                }
            }
        }
    }
`;
const Footer = () => {
    return (
        <Wrap>
            <div className="footer">
                <div className="footer-inner">
                    <div className="footer-item">
                        <div className="footer-item-inner">
                            <div className="logo-wrap">
                                <a className="link" href={BASE_URL}>
                                    <img className="logo" src="/assets/images/logo.png" alt={APP_NAME}/>
                                    <span>{APP_NAME}</span>
                                </a>
                            </div>
                            <div className="desc">At NextLift, our mission is clear: to revolutionize commuting by making it easier, smarter, and more efficient for everyone. We recognize the everyday hurdles commuters encounter—crowded bus stops, missed train connections, and the constant struggle to find the quickest route during peak hours.</div>
                        </div>
                    </div>
                    <div className="footer-item">
                        <div className="footer-item-inner">
                            <div className="heading">Quick Links</div>
                            <ul className="footer-lists">
                                <li className="footer-list"><a href={`${BASE_URL}/about-us`} className="footer-list-item">About Us</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/how-it-work`} className="footer-list-item">How It Works</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/pricing`} className="footer-list-item">Pricing</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/contact-us`} className="footer-list-item">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-item">
                        <div className="footer-item-inner">
                            <div className="heading">Important Links</div>
                            <ul className="footer-lists">
                                <li className="footer-list"><a href={`${BASE_URL}/legal-notice`} className="footer-list-item">Legal Notice</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/privacy-policy`} className="footer-list-item">Privacy Policy</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/terms-and-conditions`} className="footer-list-item">Terms and Conditions</a></li>
                                <li className="footer-list"><a href={`${BASE_URL}/faqs`} className="footer-list-item">FAQ’s</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-item">
                        <div className="footer-item-inner">
                            <div className="heading">Social Accounts</div>
                            <div className="social-wrap">
                                <a href="https://www.facebook.com/people/Next-Lift/61570158555210" target="_blank" className="social-link">{facebookIcon({width:18,height:18,fill:colors.WHITE})}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="copyright">
                <div className="inner-copyright">
                    <div className="copy">
                        <span>Copyright &copy; {new Date().getFullYear()} <a href={`${BASE_URL}`}><span className="app-name">{APP_NAME}</span></a>. All Rights Reserved.</span>
                    </div>
                </div>
            </div>
        </Wrap>
    );
}
export default Footer;