import { useAppDispatch, useAppSelector } from "../../redux/store/store"
import { setIsOpenPost } from "../../redux/slice/stateSlice"
import { recentContent, setCurrentPost } from "../../redux/slice/contentSlice"
import PostUtilsMenu from "../../PostUtilsMenu/PostUtilsMenu"
import { DocumentData } from "firebase/firestore"
import ShareCard from "../body/ShareCard/ShareCard"
import TopicsCard from "../body/TopicsCard/TopicsCard"
import LinkCard from "../body/linkCard/LinkCard"
import { useEffect } from "react"
import Styles from "./style.module.scss"
import { PostData } from "../../../utils/types"

function Content() {
    const dispatch = useAppDispatch()
    const user = useAppSelector(state => state.user.user)
    const content = useAppSelector(state => state.content.content)

    const handlePost = (data: PostData) => {
        dispatch(setIsOpenPost(true))
        dispatch(setCurrentPost(data))
    }

    useEffect(() => {
        dispatch(recentContent())
    }, [dispatch])
    return (
        <div className={Styles.body}>
            <div className={Styles.bodyContainer}>
                {user ? <ShareCard /> : ""}
                <div className={Styles.contentContainer}>
                    {
                        content ? content.map((data: DocumentData) =>
                            <div key={data.postID} className={Styles.linkCardContainer}>
                                {data.createdBy === user?.uid &&
                                    <div className={Styles.utilsMenu}>
                                        <PostUtilsMenu
                                            post={data}
                                        />
                                    </div>
                                }
                                <LinkCard data={data} onClick={handlePost} />
                            </div>)
                            : "...Loading"
                    }
                </div>
            </div>
            <div className={Styles.topicsContainer}>
                <TopicsCard />
            </div>
        </div >
    )
}

export default Content