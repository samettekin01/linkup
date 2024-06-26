import { DocumentData } from "firebase/firestore"

export interface PostState {
    createdById: string
    commentsCollectionId: string
    createdBy: string
    content: {
        createdAt: number
        description: string
        topic: string
        link: string
        title: string
    }
}

export interface EditUsersPost {
    comments: {
        postID: string
    }
    createdAt: number
    email: string
    posts: {
        postId: string
    }
    userName: string
}

export interface EditComments {
    comments: {
        commentext: string
        createdAt: number
        userId: string
        username: string
    }
}

export interface UserInformations {
    displayName: string
    email: string
    uid: string
    photoURL: string
    createdAt: number
    // posts: []
    comments: { [key: string]: string }
}

export interface PostFormikValues {
    title: string
    link: string
    description: string
    categories: { [key: string]: string }
    selectedCategory: string
    newCategory: string
    img: Blob | Uint8Array | ArrayBuffer | null
}

export interface ContentSliceTypes {
    commentsCollection: DocumentData | undefined
    commentsCollectionStatus: string
    user: Array<DocumentData>
    userStatus: string
    post: DocumentData | undefined
    postStatus: string
    content: DocumentData | undefined
    contentStatus: string
    currentPost: PostData | null
    comment: DocumentData | undefined
    commentStatus: string
}

export interface IsOpen {
    post: boolean
    getPost: boolean
    getEditPost: boolean
    snackBar: {
        message: string
        status: boolean
    }
    getPostMenu: { [key: string]: boolean }
    getComment: { [key: string]: boolean }
}

export interface UserInitialState {
    user: UserInformations | null
    userStatus: string
}

export interface CategoriesTypes {
    categories: Array<DocumentData>
    categoriesStatus: string
    category: DocumentData | undefined
    categoryStatus: string
}


export interface PostData {
    commentsCollectionId: string
    createdBy: string
    createdName: string
    userImg: string
    postID: string
    createdAt: number
    updatedAt: number
    category: string
    categoryId: string
    content: {
        title: string,
        link: string,
        description: string,
        img: string
    }
}

export interface PostState {
    currentPost: PostData | null;
}

export interface CommentData {
    commentID: string
    createdAt: number
    commentsCollectionID: string
    postId: string
    userId: string
    username: string
    userImg: string
    content: string
    updatedAt: number
    replies: {}
}

export interface Replies {
    replyId1: {
        replyId: string
        commentId: string
        userId: string
        username: string
        userImg: string
        content: string
        createdAt: number
        updatedAt: number
    }
}