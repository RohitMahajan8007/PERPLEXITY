import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import PageLoader from './PageLoader'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return <PageLoader />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }


    return children
}

export default Protected