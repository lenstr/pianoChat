import asyncio
import websockets
import datetime

logFile = open('userStatistics.log', 'a')

USERS = dict()

async def register(websocket):
    print('Add user: ' + str(websocket))
    USERS[websocket] = datetime.datetime.now()

async def unregister(websocket):
    assert( websocket in USERS )
    userTime = USERS[websocket]
    del USERS[websocket]
    time = datetime.datetime.now()
    timeStr = time.strftime("%Y-%m-%d-%H.%M.%S")
    logFile.write('{}: Log out after {}\n'.format(timeStr, time-userTime))
    logFile.flush()
    print('User was disconnected')

async def notify_users(message):
    if USERS:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(message) for user in USERS.keys()])

async def notify_users_except_me(websocket, message):
    users_without_me = set(filter(lambda x: x != websocket, USERS.keys()))
    if users_without_me:
        await asyncio.wait([user.send(message) for user in users_without_me])
        

async def hello2(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
            print('have {} users connected'.format(len(USERS)))
            await notify_users_except_me(websocket, message)
            #await websocket.send(message)
            
    finally:
        await unregister(websocket)

start_server = websockets.serve(hello2, "0.0.0.0", 6789)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

