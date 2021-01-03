import asyncio
import websockets
import datetime
import json

USERS = dict()

def userMessage():
    message = {}
    message['type'] = 'users'
    message['count'] = len(USERS)
    return json.dumps(message)

async def register(websocket):
    print('Add user: ' + str(websocket))
    USERS[websocket] = datetime.datetime.now()
    await notify_users(userMessage())

async def unregister(websocket):
    assert( websocket in USERS )
    userTime = USERS[websocket]
    del USERS[websocket]
    time = datetime.datetime.now()
    timeStr = time.strftime("%Y-%m-%d-%H.%M.%S")
    print(f'{timeStr}: Log out after {time-userTime}')
    print('User was disconnected')
    await notify_users(userMessage())

async def notify_users(message):
    if USERS:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(message) for user in USERS.keys()])

async def notify_users_except_me(websocket, message):
    users_without_me = set(filter(lambda x: x != websocket, USERS.keys()))
    if users_without_me:
        await asyncio.wait([user.send(message) for user in users_without_me])
        

async def handle_connection(websocket, path):
    await register(websocket)
    try:
        async for message in websocket:
            print(message)
            print(type(message))
            print('have {} users connected'.format(len(USERS)))
            await notify_users_except_me(websocket, message)
            #await websocket.send(message)
            
    finally:
        await unregister(websocket)

async def main():
    host = '0.0.0.0'
    port = 6789

    print(f'start listening on {host}:{port}')

    server = await websockets.serve(ws_handler=handle_connection, host=host, port=port)
    await server.wait_closed()

try:
    asyncio.run(main())
except KeyboardInterrupt:
    print('keyboard interrupt signal received')