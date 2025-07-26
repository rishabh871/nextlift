import React from "react";
import Head from "next/head";
import styled from "styled-components";
import {WIDTH} from "@constants/Common";
import colors from "@constants/Colors";
const Wrapper = styled.div`
    width:${WIDTH};max-width:100%;margin:0 auto;padding:40px 20px;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;box-sizing:border-box;
    & p{margin:0;font-size:18px;color:${colors.BLACK};}
`;
const ManyRequest = () => {
    return (
        <React.Fragment>
            <Head>
                <title>Too many requests</title>
            </Head>
            <Wrapper>
                <p>Too many requests</p>
            </Wrapper>
        </React.Fragment>
    );
}
export default ManyRequest;