import TextInput from "@/Components/TextInput";
import { router, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import ConversationItem from "../Components/App/ConversationItem"
import { useEventBus } from "@/EventBus";
import GroupModal from "@/Components/App/GroupModal";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    const conversations = page.props.auth.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [onlineUsers, setOnlineUsers] = useState({});
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const { on, emit } = useEventBus();

    const isUserOnline = (userId) => onlineUsers[userId];

    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    }

    const messageCreated = (message) => {
        setLocalConversations((oldConversations) => {
            return oldConversations.map((u) => {
                if(message.receiver_id && !u.is_group && (u.id == message.sender_id || u.id == message.receiver_id) && u.id != currentUser.id) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                if(message.group_id && u.is_group && u.id == message.group_id){
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }
                return u;
            });
        });
    };

    const messageDeleted = ({ prevMessage }) => {
        if(!prevMessage) {
            return;
        }
        
        // Find conversation by lastMessage & update last_message
        messageCreated(prevMessage);
    };

    // Create channel to recognize online users
    useEffect(() => {
        Echo.join('online')
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj };
                });
            })
            .joining((user) => {
                setOnlineUsers((prevUsers) => {
                    const updatedUsers = { ...prevUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                })
            })
            .leaving((user) => {
                setOnlineUsers((prevUsers) => {
                    const updatedUsers = { ...prevUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                })
            })
            .error((error) => {
                console.log("Error", error);
            });

        return () => {
            Echo.leave('online');
        }
    }, []);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations])

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at)
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                else if (a.blocked_at)
                    return 1;
                else if (b.blocked_at)
                    return -1;

                if (a.last_message_date && b.last_message_date)
                    return b.last_message_date.localeCompare(a.last_message_date);
                else if (a.last_message_date) 
                    return -1;
                else if (b.last_message_date)
                    return 1;
                else
                    return 0;
            })
        );
    }, [localConversations])

    useEffect(() => {
        const offCreated = on("message.created", messageCreated);
        const offDeleted = on("message.deleted", messageDeleted);
        const offModalShow = on("GroupModal.show", (group) => {
            setShowGroupModal(true);
        })
        const offGroupDelete = on("group.deleted", ({ id, name }) => {
            setLocalConversations((oldConversations) => {
                return oldConversations.filter((conversation) => conversation.id != id);
            })

            emit('toast.show', `Group ${name} was deleted`);

            if(!selectedConversation || (selectedConversation && selectedConversation.is_group && selectedConversation.id == id)) {
                router.visit(route("dashboard"));
            }
        });

        return () => {
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDelete();
        };
    }, [on]);

    console.log(selectedConversation);
    console.log(page.props);

    return (
        <>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all sm:w-[220px] sm:flex sm:flex-col md:w-[300px] bg-slate-800 overflow-hidden ${
                        selectedConversation ? "hidden -ml-[100%] sm:ml-0" : ""
                    }`}
                >
                    {/* Title */}
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
                        My Conversations
                        <div
                            className="tooltip tooltip-left"
                            data-tip="Create new group"
                        >
                            <button
                            onClick={e => setShowGroupModal(true)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                    </div>

                    {/*  */}
                    <div className="px-3 pb-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversations && 
                            sortedConversations.map((conversation) => (
                                <ConversationItem 
                                    key={`${
                                        conversation.is_group ? 
                                            "group_"
                                            : "user_"
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversation}
                                />
                            ))
                        }
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
            <GroupModal show={showGroupModal} onClose={() => setShowGroupModal(false)} />
        </>
    );
}

export default ChatLayout;