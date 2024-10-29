function PlayerMessage({ message, newThread, profileSrc }) {
    return (
        <div className="w-full flex justify-end">
            <div className="w-[95%] px-2 flex justify-end">
                <div className="bg-[#0983fc] px-4 sm:max-w-[80%] sm:max-w-[85%] min-h-[45px] py-2 rounded-lg break-all">
                    {message}
                </div>
            </div>
            <div className="hidden sm:block w-[60px]">
                {newThread ? <img src={profileSrc} className="rounded-full max-w-[60px]" /> : null}
            </div>
        </div>
    )
}

export default PlayerMessage;
