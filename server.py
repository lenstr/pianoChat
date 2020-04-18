import asyncio
import websockets

USERS = set()

async def register(websocket):
    USERS.add(websocket)

async def unregister(websocket):
    USERS.remove(websocket)

async def notify_users(message):
    if USERS:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(message) for user in USERS])

async def notify_users_except_me(websocket, message):
    users_without_me = set(filter(lambda x: x != websocket,USERS))
    if users_without_me:
        await asyncio.wait([user.send(message) for user in users_without_me])
        

async def hello2(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
            await notify_users_except_me(websocket, message)
            #await websocket.send(message)
            
    finally:
        await unregister(websocket)

start_server = websockets.serve(hello2, "0.0.0.0", 6789)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

