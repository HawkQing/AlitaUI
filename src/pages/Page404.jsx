import React from 'react'
import {Link as RouterLink} from "react-router-dom"
import {Container, Link} from "@mui/material"


export const contentPageStyle = {minHeight: 'calc(100vh - 141px)'}

const Page404 = () => {
    return (
        <Container style={{
            ...contentPageStyle,
            marginTop: '50px',
            minHeight: 'calc(100vh - 191px)'
        }}>
            Page not found. Try <Link component={RouterLink} to='/demo' color='secondary'>Demo page</Link>
        </Container>
    )
}
export default Page404