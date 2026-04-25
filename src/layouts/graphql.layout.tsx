"use client"

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { ApolloProvider } from "@apollo/client/react"
import { ReactNode } from "react"

export default function GraphQLLayout({ children }: { children: ReactNode }) {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: `/graphql`,
    }),
    cache: new InMemoryCache({}),
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
