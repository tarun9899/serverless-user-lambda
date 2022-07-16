import fetch from 'node-fetch';
import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import * as uuid from "uuid";

const endpoint = process.env.GraphQLAppsyncUrl;
console.info('Endpoint: ', endpoint);
let token: string;
const retryWaitTime = Number(process.env.RETRY_DELAY);
const maxRetryAttempt = Number(process.env.RETRY_ATTEMPT);

const httpLink: ApolloLink = createHttpLink({
    uri: endpoint,
    fetch: fetch
});

const authLink: ApolloLink = setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? token : "",
            'x-api-key': "da2-ujpwszlfujabjpa6gpzounyody"
        }
    }
});

const retryLink = new RetryLink({
    delay: {
        initial: retryWaitTime,
        max: retryWaitTime,
        jitter: false
    },
    attempts: {
        max: maxRetryAttempt,
        retryIf: (error, _operation) => !!error
    }
});

const errorLink = onError(error => {
    const { graphQLErrors, networkError } = error;
    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
            console.info(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
        );
    }
    if (networkError) {
        console.info(`[Network error]: ${networkError}`, networkError);
    }
});

export async function appsyncGetDB(event, authToken): Promise<any[]> {
    let publications: any[] = [];
    token = authToken;
    console.log('authlink', authLink)
    const client = new ApolloClient({
        link: ApolloLink.from([errorLink, retryLink, authLink.concat(httpLink)]),
        cache: new InMemoryCache()
    });
    await client.query({
        query: gql`
                    query getUserInfoDevTable($userId: String!){
                        getUserInfoDevTable(userId: $userId){
                            firstName
                            lastName
                            age
                            gender
                            department
                        }
                    }
                    `,
        variables: {
            userId: event.pathParameters.userId,
        },
    }).then(async result => {
        if (result.data !== null) {
            publications = result.data;
            console.log(result.data);
        }
    }).catch((error) => {
        if (error.graphQLErrors[0].extensions.errorCode) {
            console.info(`Error from DMYO : ${error.graphQLErrors[0].message}`);
        }
    });
    return publications;
}

export async function appsyncSaveDB(event): Promise<any[]> {
    console.log('event', JSON.parse(event.body))
    const { firstName, lastName, gender, age, department } = JSON.parse(event.body);
    const appsyncClient = new ApolloClient({
        link: ApolloLink.from([errorLink, retryLink, authLink.concat(httpLink)]),
        cache: new InMemoryCache()
    });

    const paramJson = {
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        age: age,
        department: department,
        userId: uuid.v4(),
    };
    console.log('paramJson', paramJson)
    await appsyncClient.mutate({
        mutation: gql` mutation createUserInfoDevTable($input: CreateUserInfoDevTableInput!) {
                                                                                            createUserInfoDevTable(input: $input) {
                                                                                                                                    age
                                                                                                                                    department
                                                                                                                                    gender
                                                                                                                                    firstName
                                                                                                                                    lastName
                                                                                                                                    userId
                                                                                                                                 }
       }`,
        variables: {
            input: paramJson
        }
    }).then(async resultObj => {
        console.log('paramJson', paramJson)
        console.log(resultObj.data);
        return resultObj.data
    });
    return;
}

