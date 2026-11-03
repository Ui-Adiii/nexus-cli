import {createAuthClient} from "better-auth/react"
// import {deviceAuthorizationClient} from "better-auth/plugins"
export const authClient = createAuthClient({
    baseURL:"http://localhost:8000",
    // plugins:[
    //     deviceAuthorizationClient()
    // ]
    
})