import React,{useEffect} from "react";
import Head from "next/head";
import styled from "styled-components";
import {APP_NAME,BASE_URL} from "@constants/Common";
import colors from '@constants/Colors';
import {getServerProps} from "@utils/authUtils";
import BackendLayout from "@components/Layouts/Backend";
const Wrapper = styled.div`
    display:flex;flex-direction:column;gap:25px;
    & .widgets-wrap{
        display:flex;column-gap:25px;
        & .left-wrap{
            width:30%;
            & .widget{
                background:${colors.SECONDARY};overflow:hidden;border-radius:20px;padding:20px;
                & .name{font-size:20px;color:${colors.WHITE};margin-bottom:10px;}
                & .chart-wrap{
                    position:relative;margin-top:48px;
                    & .result{
                        text-align:center;color:${colors.WHITE};center;font-size:28px;position:absolute;top:92px;right:0;left:135px;bottom:0;display:inline-table;user-select:none;
                        & span{font-size:16px;color:${colors.WHITE};}
                    }
                }
                & .info-wrap{
                    display:flex;align-items:center;column-gap:20px;justify-content:space-between;
                    & .info{
                        & .price{font-size:28px;color:${colors.WHITE};margin-bottom:5px;}
                        & .text{font-size:14px;color:${colors.WHITE};margin-bottom:16px;}
                    }
                    & img{display:flex;width:100px;height:100px;}
                }
            }
        }
        & .right-wrap{
            width:70%;display:flex;display:flex;column-gap:25px;
            &.full{width:100%;}
            & .widget{
                background:${colors.SECONDARY};overflow:hidden;border-radius:20px;padding:20px;flex:1;
                & .name{font-size:20px;color:${colors.WHITE};margin-bottom:10px;}
                & .top-wrap{
                    display:flex;align-items:center;column-gap:10px;justify-content:space-between;
                    & .icon{height:40px;width:40px;overflow:hidden;border-radius:25px;display:flex;align-items:center;justify-content:center;}
                }
                & .info{
                    & .price{font-size:24px;color:${colors.WHITE};margin-bottom:5px;}
                    & .text{font-size:14px;color:${colors.WHITE};margin-bottom:16px;}
                }
            }
        }
    }
`;
const Dashboard = ({currentUser}) => {
    useEffect(() => {
        window.scrollTo(0,0);
    },[]);
    return (
        <React.Fragment>
            <Head>
                <title>{`Dashboard - ${APP_NAME}`}</title>
            </Head>
            <BackendLayout page="dashboard">
                <Wrapper>
                <div className="widgets-wrap">
                        <div className="left-wrap">
                            <div className="widget">
                                <div className="name">Welcome {currentUser.first_name}</div>
                                <div className="info-wrap">
                                    <div className="info">
                                        <div className="price">$168.5K</div>
                                    </div>
                                    <img src={`${BASE_URL}/assets/images/gift.png`} alt="Gift"/>
                                </div>
                            </div>
                        </div>
                        <div className="right-wrap">
                            <div className="widget">
                                <div className="info">
                                    <div className="price">10</div>
                                    <div className="text">Total Users</div>
                                </div>
                            </div>
                            <div className="widget">
                                <div className="info">
                                    <div className="price">500</div>
                                    <div className="text">Total Orders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="widgets-wrap">
                        <div className="right-wrap full">
                            <div className="widget">
                                <div className="name">Sales</div>
                            </div>
                        </div>
                    </div>
                </Wrapper>
            </BackendLayout>
        </React.Fragment>
    );
}
export const getServerSideProps = async(context) => {
    return getServerProps(context,{},"DASHBOARD:VIEW");
}
export default Dashboard;