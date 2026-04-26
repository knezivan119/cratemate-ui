import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { useCamera } from 'src/uses/cameraUse'
import { withSetup } from '../helpers/withSetupHelper'

// Camera plumbing is heavily browser-API dependent (getUserMedia, MediaStream,
// canvas.toBlob). We mock the navigator.mediaDevices surface to verify the
// composable's state transitions; capture()'s canvas/blob path is not exercised
// here because happy-dom's canvas implementation is not full-fidelity.

function makeStream () {
    const tracks = [ { stop: vi.fn() } ]
    return {
        getTracks: () => tracks,
        _tracks:   tracks,
    }
}

describe( 'cameraUse', () => {
    let harness, getUserMedia, enumerateDevices

    beforeEach( () => {
        getUserMedia      = vi.fn()
        enumerateDevices  = vi.fn().mockResolvedValue( [] )

        // Patch navigator.mediaDevices and isSecureContext for `supported` detection.
        Object.defineProperty( window, 'isSecureContext', { value: true, configurable: true } )
        Object.defineProperty( navigator, 'mediaDevices', {
            value: { getUserMedia, enumerateDevices },
            configurable: true,
        } )

        harness = withSetup( () => useCamera() )
    } )

    afterEach( () => {
        harness.unmount()
    } )

    it( 'detects camera support when mediaDevices is available', () => {
        expect( harness.result.supported ).toBe( true )
    } )

    it( 'initial state: not streaming, no error, empty devices', () => {
        const { streaming, error, devices } = harness.result
        expect( streaming.value ).toBe( false )
        expect( error.value ).toBeNull()
        expect( devices.value ).toEqual( [] )
    } )

    it( 'startCamera success sets streaming true and enumerates devices', async () => {
        const stream = makeStream()
        getUserMedia.mockResolvedValue( stream )
        enumerateDevices.mockResolvedValue( [
            { kind: 'videoinput', deviceId: 'cam-1', label: 'Front' },
            { kind: 'audioinput', deviceId: 'mic-1', label: 'Mic' },
        ] )

        await harness.result.startCamera()

        expect( harness.result.streaming.value ).toBe( true )
        expect( harness.result.devices.value ).toEqual( [
            { kind: 'videoinput', deviceId: 'cam-1', label: 'Front' },
        ] )
    } )

    it( 'startCamera failure sets error and leaves streaming false', async () => {
        getUserMedia.mockRejectedValue( Object.assign( new Error( 'denied' ), { name: 'NotAllowedError' } ) )

        await harness.result.startCamera()

        expect( harness.result.streaming.value ).toBe( false )
        expect( harness.result.error.value ).toMatch( /NotAllowedError/ )
    } )

    it( 'stopCamera stops all tracks on the active stream', async () => {
        const stream = makeStream()
        getUserMedia.mockResolvedValue( stream )

        await harness.result.startCamera()
        harness.result.stopCamera()

        expect( harness.result.streaming.value ).toBe( false )
        expect( stream._tracks[ 0 ].stop ).toHaveBeenCalled()
    } )

    it( 'restartIfStreaming is a no-op when not streaming', async () => {
        await harness.result.restartIfStreaming()
        expect( getUserMedia ).not.toHaveBeenCalled()
    } )

    it( 'restartIfStreaming re-invokes getUserMedia when streaming', async () => {
        getUserMedia.mockResolvedValue( makeStream() )

        await harness.result.startCamera()
        getUserMedia.mockClear()
        getUserMedia.mockResolvedValue( makeStream() )

        await harness.result.restartIfStreaming()
        expect( getUserMedia ).toHaveBeenCalledTimes( 1 )
    } )

    it( 'capture returns null when not streaming', async () => {
        const blob = await harness.result.capture()
        expect( blob ).toBeNull()
    } )
} )
