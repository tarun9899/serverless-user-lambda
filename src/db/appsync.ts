import fetch from 'node-fetch';
import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import * as uuid from "uuid";
let userData: any[] = [];
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
            userData = result.data;
            console.log(result.data);
        }
    }).catch((error) => {
        if (error.graphQLErrors[0].extensions.errorCode) {
            console.info(`Error from DMYO : ${error.graphQLErrors[0].message}`);
        }
    });
    return userData;
}

export async function appsyncSaveDB(event: any): Promise<any[]> {
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
        console.log('data', resultObj.data.createUserInfoDevTable);
        userData = resultObj.data.createUserInfoDevTable
    });
    return userData;
}

export async function appsyncALLDB(): Promise<any[]> {
    const appsyncClient = new ApolloClient({
        link: ApolloLink.from([errorLink, retryLink, authLink.concat(httpLink)]),
        cache: new InMemoryCache()
    });

    await appsyncClient.query({
        query: gql` query listUserInfoDevTables {
               listUserInfoDevTables {
               items {
                  age
                  department
                  firstName
                  gender
                  lastName
                  userId
                 }
            }
        }`,
        variables: {

        }
    }).then(async resultObj => {
        console.log('data', resultObj.data.listUserInfoDevTables);
        userData = resultObj.data.listUserInfoDevTables
    });
    return userData;
}

export async function appsyncDeleteDB(event: any): Promise<any[]> {
    const appsyncClient = new ApolloClient({
        link: ApolloLink.from([errorLink, retryLink, authLink.concat(httpLink)]),
        cache: new InMemoryCache()
    });
    const paramJson = {
        userId: event.pathParameters.userId
    };
    console.log('paramJson', paramJson)
    await appsyncClient.mutate({
        mutation: gql` mutation deleteUserInfoDevTable($input:DeleteUserInfoDevTableInput!) {
                        deleteUserInfoDevTable(input:$input) {
                        age
                        department
                        firstName
                        gender
                        lastName
                        userId
                    }
            }`,
        variables: {
            input: paramJson
        }
    }).then(async resultObj => {
        console.log('data', resultObj.data.deleteUserInfoDevTable);
        userData = resultObj.data.deleteUserInfoDevTable
    });
    return userData;
}

export async function appsyncUpdateeDB(event: any): Promise<any[]> {
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
        userId: event.pathParameters.userId
    };
    console.log('paramJson', paramJson)
    await appsyncClient.mutate({
        mutation: gql` mutation updateUserInfoDevTable($input: UpdateUserInfoDevTableInput!) {
                        updateUserInfoDevTable(input: $input) {
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
        console.log('data', resultObj.data.updateUserInfoDevTable);
        userData = resultObj.data.updateUserInfoDevTable
    });
    return userData;
}

