function OpponentMessage({ message, newThread, profileSrc }) {
    return (
        <div className="w-full flex">
            <div className="hidden sm:block w-[60px]">
                {newThread ? <img src={profileSrc} className="rounded-full max-w-[60px]" /> : null}
            </div>
            <div className="w-[80%] px-2 flex justify-start">
                <div className="bg-white text-black px-4 xl:max-w-[75%] min-h-[45px] py-2 rounded-lg break-all">
                    {message}
                </div>
            </div>
        </div>
    );
}

export default OpponentMessage;
