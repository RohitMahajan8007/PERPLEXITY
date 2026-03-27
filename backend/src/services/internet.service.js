import {tavily as Tavily} from "@tavily/core";




const tavily =  Tavily({apiKey : process.env.TAVILY_API_KEYS});

export const searchInternet = async ({query})=>{

     console.log("Searching:", query);

    const result =  await tavily.search(query,{
        maxResults:5,
        searchDepth:"basic"
    })
    return JSON.stringify(result)
}